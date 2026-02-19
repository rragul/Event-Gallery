import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { verify } from "@node-rs/argon2";
import { SignJWT } from "jose";

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { whatsAppNumber, password } = payload;

        const host = await getHost(whatsAppNumber);
        if (!host) {
            throw { statusCode: 400, message: "Invalid login credentials" };
        }

        const passwordMatch = await verify(host.Signature, password);
        if (!passwordMatch) {
            throw { statusCode: 400, message: "Invalid login credentials" };
        }

        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        const refreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);

        await updateRefreshToken(whatsAppNumber, refreshToken);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken, refreshToken }),
        };
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal error";
        console.error({ level: "ERROR", message: "Handler error", error });
        return {
            statusCode,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message }),
        };
    }
};

async function getHost(whatsAppNumber) {
    const PK = "HOST";
    const SK = `HOST#${whatsAppNumber}`;

    const result = await ddbClient.send(
        new GetItemCommand({
            Key: marshall({ PK, SK }),
            TableName: process.env.DYNAMODB_TABLE_NAME,
            ProjectionExpression: "Signature",
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
