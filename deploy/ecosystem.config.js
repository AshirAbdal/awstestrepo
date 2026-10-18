module.exports = {
    apps: [
        {
            name: "api-backend",
            script: "app.py",
            cwd: "/home/ubuntu/api-server/backend",
            interpreter: "python3",
            args: "--host 0.0.0.0 --port 8000",
            instances: 1,
            autorestart: true,
            max_memory_restart: "200M",
            out_file: "/home/ubuntu/api-server/logs/out.log",
            error_file: "/home/ubuntu/api-server/logs/error.log",
        },
    ],
};
