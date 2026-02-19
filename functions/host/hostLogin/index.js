import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { verify } from "@node-rs/argon2";
import { SignJWT } from "jose";

const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: "Invalid login credentials",
};

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { whatsAppNumber, password } = payload;

        const host = await getHost(whatsAppNumber);
        if (!host.result) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);

        const passwordMatch = await verifyPassword(host.result.Signature, password);
        if (!passwordMatch.result) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);

        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        if (!accessToken.result) throw new Error(accessToken.message);

        const refreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);
        if (!refreshToken.result) throw new Error(refreshToken.message);

        const updateResult = await updateRefreshToken(whatsAppNumber, refreshToken.result);
        if (!updateResult.status) throw new Error(updateResult.message);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken: accessToken.result, refreshToken: refreshToken.result }),
        };
    } catch (error) {
        console.error({ level: "ERROR", message: "Handler error", error });

        if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
            return {
                statusCode: 400,
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

const getHost = async (whatsAppNumber) => {
    const returnValue = { message: null, result: null };
    try {
        const PK = "HOST";
        const SK = `HOST#${whatsAppNumber}`;

        const db_response = await ddbClient.send(
            new GetItemCommand({
                Key: marshall({ PK, SK }),
                TableName: process.env.DYNAMODB_TABLE_NAME,
                ProjectionExpression: "Signature",
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

const verifyPassword = async (hash, password) => {
    const returnValue = { message: null, result: false };
    try {
        returnValue.result = await verify(hash, password);
        return returnValue;
    } catch (error) {
        console.error("Error in verifyPassword:", error);
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
