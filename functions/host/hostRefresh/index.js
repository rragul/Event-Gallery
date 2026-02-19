import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { jwtVerify, SignJWT } from "jose";

const ERROR_MESSAGES = {
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
};

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { refreshToken } = payload;

        // 1. Verify the refresh token signature & claims
        const verifyResult = await verifyRefreshToken(refreshToken);
        if (!verifyResult.result) throw new Error(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);

        const whatsAppNumber = verifyResult.result.sub;

        // 2. Check the refresh token matches what's stored in DynamoDB
        const host = await getHost(whatsAppNumber);
        if (!host.result || host.result.RefreshToken !== refreshToken) {
            throw new Error(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
        }

        // 3. Issue new access token + new refresh token (rotation)
        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        if (!accessToken.result) throw new Error(accessToken.message);

        const newRefreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);
        if (!newRefreshToken.result) throw new Error(newRefreshToken.message);

        // 4. Store the new refresh token in DynamoDB (invalidates the old one)
        const updateResult = await updateRefreshToken(whatsAppNumber, newRefreshToken.result);
        if (!updateResult.status) throw new Error(updateResult.message);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken: accessToken.result, refreshToken: newRefreshToken.result }),
        };
    } catch (error) {
        console.error({ level: "ERROR", message: "Handler error", error });

        if (error.message === ERROR_MESSAGES.INVALID_REFRESH_TOKEN) {
            return {
                statusCode: 401,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: error.message }),
            };
        }

        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Internal error" }),
        };
    }
};

const verifyRefreshToken = async (token) => {
    const returnValue = { message: null, result: null };
    try {
        const secret = Buffer.from(process.env.JWT_SECRET, "hex");
        const { payload } = await jwtVerify(token, secret, {
            issuer: process.env.ISS,
            audience: process.env.REF_AUD,
            algorithms: ["HS256"],
        });
        returnValue.result = payload;
        return returnValue;
    } catch (error) {
        console.error("Error in verifyRefreshToken:", error);
        returnValue.message = error.message;
        return returnValue;
    }
};

const getHost = async (whatsAppNumber) => {
    const returnValue = { message: null, result: null };
    try {
        const PK = "HOST";
        const SK = `HOST#${whatsAppNumber}`;

        const db_response = await ddbClient.send(
            new GetItemCommand({
                Key: marshall({ PK, SK }),
                TableName: process.env.DYNAMODB_TABLE_NAME,
                ProjectionExpression: "RefreshToken",
            })
        );

        if (!db_response.Item) {
            returnValue.result = null;
            return returnValue;
        }

        returnValue.result = unmarshall(db_response.Item);
        return returnValue;
    } catch (error) {
        console.error("Error in getHost:", error);
        returnValue.message = error.message;
        return returnValue;
    }
};

const updateRefreshToken = async (whatsAppNumber, refreshToken) => {
    const returnValue = { message: null, status: false };
    try {
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

        returnValue.status = true;
        return returnValue;
    } catch (error) {
        console.error("Error in updateRefreshToken:", error);
        returnValue.message = error.message;
        return returnValue;
    }
};

const generateToken = async (subject, audience, expiresIn) => {
    const returnValue = { message: null, result: null };
    try {
        const secret = Buffer.from(process.env.JWT_SECRET, "hex");
        returnValue.result = await new SignJWT({})
            .setProtectedHeader({ alg: "HS256" })
            .setSubject(subject)
            .setIssuedAt()
            .setIssuer(process.env.ISS)
            .setAudience(audience)
            .setExpirationTime(expiresIn)
            .sign(secret);
        return returnValue;
    } catch (error) {
        console.error("Error in generateToken:", error);
        returnValue.message = error.message;
        return returnValue;
    }
};
