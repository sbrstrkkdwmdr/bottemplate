declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            PREFIX: string;
        }
    }
}

export { };

