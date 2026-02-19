import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { jwtVerify, SignJWT } from "jose";

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { refreshToken } = payload;

        // 1. Verify the refresh token signature & claims
        const { payload: tokenPayload } = await verifyRefreshToken(refreshToken);
        const whatsAppNumber = tokenPayload.sub;

        // 2. Check the refresh token matches what's stored in DynamoDB
        const host = await getHost(whatsAppNumber);
        if (!host || host.RefreshToken !== refreshToken) {
            throw { statusCode: 401, message: "Invalid or expired refresh token" };
        }

        // 3. Issue new access token + new refresh token (rotation)
        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        const newRefreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);

        // 4. Store the new refresh token in DynamoDB (invalidates the old one)
        await updateRefreshToken(whatsAppNumber, newRefreshToken);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken, refreshToken: newRefreshToken }),
        };
    } catch (error) {
        const statusCode = error.statusCode || 401;
        const message = error.message || "Unauthorized";
        console.error({ level: "ERROR", message: "Handler error", error });
        return {
            statusCode,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message }),
        };
    }
};

async function verifyRefreshToken(token) {
    const secret = Buffer.from(process.env.JWT_SECRET, "hex");
    return jwtVerify(token, secret, {
        issuer: process.env.ISS,
        audience: process.env.REF_AUD,
        algorithms: ["HS256"],
    });
}

async function getHost(whatsAppNumber) {
    const PK = "HOST";
    const SK = `HOST#${whatsAppNumber}`;

    const result = await ddbClient.send(
        new GetItemCommand({
            Key: marshall({ PK, SK }),
            TableName: process.env.DYNAMODB_TABLE_NAME,
            ProjectionExpression: "RefreshToken",
        })
    );

    if (!result.Item) return null;
    return unmarshall(result.Item);
}

async function updateRefreshToken(whatsAppNumber, refreshToken) {
    const PK = "HOST";
    const SK = `HOST#${whatsAppNumber}`;

    await ddbClient.send(
        new UpdateItemCommand({
            Key: marshall({ PK, SK }),
            ExpressionAttributeNames: { "#RefreshToken": "RefreshToken" },
            ExpressionAttributeValues: marshall({ ":RefreshToken": refreshToken }),
            UpdateExpression: "SET #RefreshToken = :RefreshToken",
            TableName: process.env.DYNAMODB_TABLE_NAME,
        })
    );
}

async function generateToken(subject, audience, expiresIn) {
    const secret = Buffer.from(process.env.JWT_SECRET, "hex");
    return new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(subject)
        .setIssuedAt()
        .setIssuer(process.env.ISS)
        .setAudience(audience)
        .setExpirationTime(expiresIn)
        .sign(secret);
}
