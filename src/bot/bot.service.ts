import { Injectable } from '@nestjs/common';
import { TELEGRAM_BOT_TOKEN } from 'telegram.bot';
import * as Telegram from 'node-telegram-bot-api';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BotService {
    private bot: Telegram;

    constructor(private readonly httpService: HttpService) {
        this.bot = new Telegram(TELEGRAM_BOT_TOKEN, {polling: true});
        this.send();
    }

    private async getPost(name: string) {
        const post = await firstValueFrom(this.httpService.get(`https://dragonball-api.com/api/characters?name=${name}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })).then((res) => {
            return res.data;
        });
        //console.log(post)
        const content = post[0].description;
        console.log(post);


        return content;
    }

    private async send() {

        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'Hola, soy Diente Nostálgico');
        })

        this.bot.onText(/\/help/, async msg => {
            const namePrompt = await this.bot.sendMessage(msg.chat.id, "¿Qué personaje desean buscar?", {
                reply_markup: {
                    force_reply: true,
                },
            });
            this.bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
                const name = nameMsg.text;
                const character = await this.getPost(name);
                // save name in DB if you want to ...
                await this.bot.sendMessage(msg.chat.id, character);
            });
        });
    }


}
