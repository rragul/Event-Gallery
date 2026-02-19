import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { hash } from "@node-rs/argon2";
import { SignJWT } from "jose";

const ERROR_MESSAGES = {
    HOST_ALREADY_EXISTS: "Host already exists",
};

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { whatsAppNumber, password, name, email } = payload;

        const passwordHash = await hashPassword(password);
        if (!passwordHash.result) throw new Error(passwordHash.message);

        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        if (!accessToken.result) throw new Error(accessToken.message);

        const refreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);
        if (!refreshToken.result) throw new Error(refreshToken.message);

        const createResult = await createHost({ whatsAppNumber, name, email, passwordHash: passwordHash.result, refreshToken: refreshToken.result });
        if (!createResult.status) throw new Error(createResult.message);

        return {
            statusCode: 201,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken: accessToken.result, refreshToken: refreshToken.result }),
        };
    } catch (error) {
        console.error({ level: "ERROR", message: "Handler error", error });

        if (error.message === ERROR_MESSAGES.HOST_ALREADY_EXISTS) {
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

const hashPassword = async (password) => {
    const returnValue = { message: null, result: null };
    try {
        returnValue.result = await hash(password);
        return returnValue;
    } catch (error) {
        console.error("Error in hashPassword:", error);
        returnValue.message = error.message;
        return returnValue;
    }
};

const createHost = async ({ whatsAppNumber, name, email, passwordHash, refreshToken }) => {
    const returnValue = { message: null, status: false };
    try {
        const PK = "HOST";
        const SK = `HOST#${whatsAppNumber}`;

        await ddbClient.send(
            new PutItemCommand({
                TableName: process.env.DYNAMODB_TABLE_NAME,
                Item: marshall({
                    PK,
                    SK,
                    HostDetails: { whatsAppNumber, name, email },
                    Signature: passwordHash,
                    RefreshToken: refreshToken,
                    Status: "active",
                    CreatedAt: Date.now(),
                }),
                ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)",
            })
        );

        returnValue.status = true;
        return returnValue;
    } catch (error) {
        console.error("Error in createHost:", error);
        if (error.name === "ConditionalCheckFailedException") {
            returnValue.message = ERROR_MESSAGES.HOST_ALREADY_EXISTS;
            return returnValue;
        }
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
