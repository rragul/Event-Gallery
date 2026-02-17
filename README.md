# AWS CDK Template

This repository provides a ready-to-use AWS CDK template for building serverless backend applications. It includes a pre-structured layout for API Gateway, Lambda functions, request models, and DynamoDB integrations, making it easy to start new projects without rebuilding the setup each time.

## 📦 Tech Stack

- **AWS CDK v2** (TypeScript)
- **API Gateway (REST)**
- **AWS Lambda** (Node.js)
- **DynamoDB**
- Built-in **request validation models**
- Organized **Lambda directory structure** (admin, user, guest, auth)

## 📁 Project Structure

```
cdk-template/
├── bin/
│   └── template.ts
├── lib/
│   ├── apiEndpoints/
│   ├── lambdaFns/
│   ├── requestModels.ts
│   ├── restApi.ts
│   ├── dynamoDB.ts
│   ├── utils.ts
│   └── template-stack.ts
├── functions/
│   ├── admin/
│   ├── auth/
│   ├── guest/
│   └── user/
├── test/
├── package.json
├── tsconfig.json
└── cdk.json
```

## 🚀 Getting Started

### 1. Install Dependencies
```
npm install
```

### 2. Bootstrap CDK
```
cdk bootstrap
```

### 3. Deploy
```
cdk deploy
```

### 4. Synthesize
```
cdk synth
```

## 🧩 Template Highlights

### 1. Preconfigured REST API
- Central API setup
- Endpoint grouping
- Lambda integration
- Validation models

### 2. Lambda Function Structure
```
functions/
 ├── admin/
 ├── auth/
 ├── guest/
 └── user/
```

### 3. DynamoDB Template
Includes table setup and permissions.

### 4. Request Models
Reusable API Gateway schemas.

## 🧱 Creating a New Project

### Clone
```
git clone <repo-url> my-new-project
cd my-new-project
rm -rf .git
npm install
```

### Download ZIP
Extract → rename → install dependencies.

## 🧪 Useful Commands

```
cdk diff
cdk destroy
cdk watch
```

## 📝 Adding a New API Endpoint

1. Add handler under `functions/`
2. Add route under `lib/apiEndpoints/`
3. Add schemas in `lib/requestModels.ts`
4. Deploy
