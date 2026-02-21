import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { SignJWT } from "jose";

const ERROR_MESSAGES = {
    HOST_NOT_FOUND: "Host not found",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED: "OTP has expired. Please sign up again",
};

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { whatsAppNumber, otp } = payload;

        const host = await getHost(whatsAppNumber);
        if (!host.result) throw new Error(ERROR_MESSAGES.HOST_NOT_FOUND);

        const { Otp, OtpExpiresAt } = host.result;

        if (Otp !== otp) throw new Error(ERROR_MESSAGES.INVALID_OTP);
        if (Date.now() > OtpExpiresAt) throw new Error(ERROR_MESSAGES.OTP_EXPIRED);

        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        if (!accessToken.result) throw new Error(accessToken.message);

        const refreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);
        if (!refreshToken.result) throw new Error(refreshToken.message);

        const activateResult = await activateHost(whatsAppNumber, refreshToken.result);
        if (!activateResult.status) throw new Error(activateResult.message);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken: accessToken.result, refreshToken: refreshToken.result }),
        };
    } catch (error) {
        console.error({ level: "ERROR", message: "Handler error", error });

        const clientErrors = [
            ERROR_MESSAGES.HOST_NOT_FOUND,
            ERROR_MESSAGES.INVALID_OTP,
            ERROR_MESSAGES.OTP_EXPIRED,
        ];

        if (clientErrors.includes(error.message)) {
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
                ProjectionExpression: "Otp, OtpExpiresAt, #S",
                ExpressionAttributeNames: { "#S": "Status" },
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

const activateHost = async (whatsAppNumber, refreshToken) => {
    const returnValue = { message: null, status: false };
    try {
        const PK = "HOST";
        const SK = `HOST#${whatsAppNumber}`;

        await ddbClient.send(
            new UpdateItemCommand({
                Key: marshall({ PK, SK }),
                ExpressionAttributeNames: {
                    "#Status": "Status",
                    "#RefreshToken": "RefreshToken",
                    "#Otp": "Otp",
                    "#OtpExpiresAt": "OtpExpiresAt",
                },
                ExpressionAttributeValues: marshall({
                    ":active": "active",
                    ":refreshToken": refreshToken,
                }),
                UpdateExpression:
                    "SET #Status = :active, #RefreshToken = :refreshToken REMOVE #Otp, #OtpExpiresAt",
                TableName: process.env.DYNAMODB_TABLE_NAME,
            })
        );

        returnValue.status = true;
        return returnValue;
    } catch (error) {
        console.error("Error in activateHost:", error);
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
