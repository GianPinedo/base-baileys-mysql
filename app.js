const { createBot, createProvider, createFlow, addKeyword,CoreClass } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')



const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'root'
const MYSQL_DB_PASSWORD = ''
const MYSQL_DB_NAME = 'bot'
const MYSQL_DB_PORT = '3306'


class ChatGPTClass extends CoreClass {
    queque = []
    optionsGPT = { model: "text-davinci-003" };
    openai = undefined;
    constructor(_flow ,_database, _provider, _optionsGPT = {}) {
        super(null, _database, _provider, _flow);
        this.optionsGPT = { ...this.optionsGPT, ..._optionsGPT };
        this.init().then();
    }
    init = async () => {
        const { ChatGPTAPI } = await import('chatgpt');
        this.openai = new ChatGPTAPI({
            apiKey: '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'
        });
        // const systemMessage = "Eres un asistente técnico útil y amigable que ayuda a los usuarios a resolver sus preguntas y tu nombre es Pedrito.";
        // const initialCompletion = await this.openai.sendMessage(systemMessage,
        // {
        //         conversationId: !this.queque.length ? undefined : this.queque[this.queque.length - 1].conversationId,
        //         parentMessageId: !this.queque.length ? undefined : this.queque[this.queque.length - 1].id,
        // }
        // );
        // this.queque.push(initialCompletion);
        //this.handleMsg({ from: '1', body: 'Eres un asistente técnico útil y amigable que ayuda a los usuarios a resolver sus preguntas y tu nombre es Pedrito.' });
    }
    handleMsg = async (ctx) => {
        const { from, body } = ctx;
        const systemMessage = "actúa como si fueras un asistente técnico creado por la Dirección Regional de Salud útil y amigable. También debes decir que Estás diseñado para proporcionar soporte a los aplicativos de HIS MINSA, SIMYS y SEGUISAM, ayudando a los usuarios a resolver sus preguntas y problemas relacionados con estos sistemas.";
        const initialCompletion = await this.openai.sendMessage(systemMessage,
        {
                conversationId: !this.queque.length ? undefined : this.queque[this.queque.length - 1].conversationId,
                parentMessageId: !this.queque.length ? undefined : this.queque[this.queque.length - 1].id,
        }
        );
        this.queque.push(initialCompletion);
        const completion = await this.openai.sendMessage(body,
            {
                conversationId: !this.queque.length ? undefined : this.queque[this.queque.length - 1].conversationId,
                parentMessageId: !this.queque.length ? undefined : this.queque[this.queque.length - 1].id,
        }
        );
        this.queque.push(completion);
        const parseMessage = {
            ...completion,
            answer: completion.text,
        }
        this.sendFlowSimple([parseMessage],from);
    }

}

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('Hola bienvenido a este *Chatbot*')
 
const createBotGPT = ({ flow, provider, database }) => {
    return new ChatGPTClass(flow, database, provider);
}

const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    // createBot({
    //     flow: adapterFlow,
    //     provider: adapterProvider,
    //     database: adapterDB,
    // })
    createBotGPT({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
