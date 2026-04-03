# 🛰️ Collabryx: From Zero to Cloud Onboarding Guide

Welcome! This guide is designed for developers who have just created their GitHub account and are ready to launch their first AWS EC2 instance. We will take you from a local project to a live development environment in 5 easy phases.

---

## 🏗️ Phase 1: GitHub Foundation

First, we need to push your local code to your new GitHub account.

1.  **Open your terminal** in the `collabryx/` root directory.
2.  **Initialize Git**:
    ```bash
    git init
    ```
3.  **Stage all files**:
    ```bash
    git add .
    ```
    *(Don't worry, the `.gitignore` I created will skip the heavy `node_modules`.)*
4.  **Commit the code**:
    ```bash
    git commit -m "feat: Initial Collabryx commit for deployment"
    ```
5.  **Create a New Repository on GitHub**:
    -   Go to [github.com/new](https://github.com/new).
    -   Name it `collabryx`.
    -   Leave it as **Public** and click **Create repository**.
6.  **Push your code**:
    -   Follow the instructions on GitHub to add the remote and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/collabryx.git
    git branch -M main
    git push -u origin main
    ```

---

## ☁️ Phase 2: AWS Account Creation

1.  **Sign up**: Go to [aws.amazon.com](https://aws.amazon.com/) and click **Create an AWS Account**.
2.  **Verification**: You will need to provide a credit card for verification. 
    > [!NOTE]
    > AWS offers a **Free Tier** for 12 months, which includes the `t2.micro` or `t3.micro` instances we will use. You won't be charged unless you exceed the free limits.
3.  **Access the Console**: Once verified, log in as the **Root User**.

---

## 🚀 Phase 3: The EC2 Launchpad

1.  **Go to EC2**: Search for "EC2" in the search bar and click it.
2.  **Launch Instance**: Click the orange **Launch instance** button.
3.  **Configure Instance**:
    -   **Name**: `Collabryx-Server`
    -   **OS**: **Ubuntu 22.04 LTS (64-bit x86)**
    -   **Instance type**: `t2.micro` (or `t3.micro` if available in your region) - Look for the "Free tier eligible" tag.
    -   **Key pair**: Click **Create new key pair**.
        -   Name: `collabryx-key`
        -   Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows PuTTY).
        -   **SAVE THIS FILE!** You can only download it once.
4.  **Security Groups (Firewall)**:
    -   Allow **SSH** from "My IP" or "Anywhere" (0.0.0.0/0).
    -   Check the box: **Allow HTTP traffic from the internet**.
5.  **Launch**: Click **Launch instance**.

---

## 🌉 Phase 4: The SSH Bridge

Now, let's connect your computer to the cloud server.

1.  **Locate your key**: Find the `collabryx-key.pem` file you downloaded.
2.  **Set permissions (Mac/Linux)**:
    ```bash
    chmod 400 collabryx-key.pem
    ```
3.  **Connect via SSH**:
    -   In the AWS Console, click on your instance ID and find the **Public IPv4 address**.
    -   Run this command in your terminal:
    ```bash
    ssh -i "collabryx-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
    ```
4.  **Accept the connection**: Type `yes` if prompted about the authenticity of the host.

---

## 🔥 Phase 5: Deployment Command

Now that you are *inside* the cloud server, follow these final steps:

1.  **Clone your repo**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/collabryx.git
    cd collabryx
    ```
2.  **Set up Environment Variables**:
    -   Create the backend `.env` file manually:
    ```bash
    nano backend/.env
    ```
    -   Paste your `MONGO_URI` and `JWT_SECRET` (Use Ctrl+O, Enter, Ctrl+X to save).
3.  **Run the Deployment Script**:
    ```bash
    chmod +x deploy/deploy.sh
    ./deploy/deploy.sh
    ```

✨ **You're live!** Visit your `EC2_PUBLIC_IP` in any browser to start collaborating!
