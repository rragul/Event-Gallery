import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";
import { hash } from "@node-rs/argon2";
import { SignJWT } from "jose";

export const handler = async (event) => {
    try {
        const payload = JSON.parse(event.body);
        const { whatsAppNumber, password, name, email } = payload;

        const passwordHash = await hash(password);

        const accessToken = await generateToken(whatsAppNumber, process.env.ACC_AUD, process.env.ACC_EXP);
        const refreshToken = await generateToken(whatsAppNumber, process.env.REF_AUD, process.env.REF_EXP);

        await createHost({ whatsAppNumber, name, email, passwordHash, refreshToken });

        return {
            statusCode: 201,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ accessToken, refreshToken }),
        };
    } catch (error) {
        console.error({ level: "ERROR", message: "Handler error", error });

        if (error.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Host already exists" }),
            };
        }

        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Internal error" }),
        };
    }
};

async function createHost({ whatsAppNumber, name, email, passwordHash, refreshToken }) {
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
            ConditionExpression:
                "attribute_not_exists(PK) AND attribute_not_exists(SK)",
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
