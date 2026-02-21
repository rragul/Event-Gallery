import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { hash } from "@node-rs/argon2";

const ERROR_MESSAGES = {
    HOST_ALREADY_ACTIVE: "Host already exists",
};

const OTP_TTL_MINUTES = 10;

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { whatsAppNumber, password, name, email } = payload;

        const passwordHash = await hashPassword(password);
        if (!passwordHash.result) throw new Error(passwordHash.message);

        const otp = generateOtp();
        const otpExpiresAt = Date.now() + OTP_TTL_MINUTES * 60 * 1000;

        const createResult = await createHost({ whatsAppNumber, name, email, passwordHash: passwordHash.result, otp, otpExpiresAt });
        if (!createResult.status) throw new Error(createResult.message);

        // TODO: Replace with WhatsApp/Meta API call when access is granted
        console.info(`[DEV] OTP for ${whatsAppNumber}: ${otp}`);

        return {
            statusCode: 201,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "OTP sent to your WhatsApp number" }),
        };
    } catch (error) {
        console.error({ level: "ERROR", message: "Handler error", error });

        if (error.message === ERROR_MESSAGES.HOST_ALREADY_ACTIVE) {
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

const generateOtp = () => {
    // Use hardcoded OTP when env var is set (dev bypass for WhatsApp API)
    if (process.env.HARDCODED_OTP) return process.env.HARDCODED_OTP;
    return String(Math.floor(100000 + Math.random() * 900000));
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

const createHost = async ({ whatsAppNumber, name, email, passwordHash, otp, otpExpiresAt }) => {
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
                    Otp: otp,
                    OtpExpiresAt: otpExpiresAt,
                    Status: "pending",
                    CreatedAt: Date.now(),
                }),
                // Allow overwrite only if status is "pending" (expired OTP retry)
                // Block if status is "active" (already registered host)
                ConditionExpression: "attribute_not_exists(PK) OR #Status = :pending",
                ExpressionAttributeNames: { "#Status": "Status" },
                ExpressionAttributeValues: marshall({ ":pending": "pending" }),
            })
        );

        returnValue.status = true;
        return returnValue;
    } catch (error) {
        console.error("Error in createHost:", error);
        if (error.name === "ConditionalCheckFailedException") {
            returnValue.message = ERROR_MESSAGES.HOST_ALREADY_ACTIVE;
            return returnValue;
        }
        returnValue.message = error.message;
        return returnValue;
    }
};

