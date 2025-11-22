/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {},
    async headers(){
        return[
            {
                source: "/api/(.*)",
                headers:[
                    {
                        key:"Access-Control-Allow-Origin",
                        // for development to everyone
                        value: "*"
                    },
                    {
                        key:"Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, DELETE, OPTIONS"
                    },
                    {
                        key:"Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization"
                    },
                    {
                        key:"Content-Range",
                        value: "bytes : 0-9/*"
                    },
                ],
            },
            {
                source: "/manifest.json",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/manifest+json"
                    },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=0, must-revalidate"
                    }
                ]
            },
            {
                source: "/service-worker.js",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/javascript"
                    },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=0, must-revalidate"
                    },
                    {
                        key: "Service-Worker-Allowed",
                        value: "/"
                    }
                ]
            }
        ];
    },
};

export default nextConfig;
