import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `<footer><a href="/swagger">https://api.subvind.com/swagger</a><br /><br /><p style="margin: 0;">api.subvind.com © ${new Date().getFullYear()}.</p> <p style="margin: 0;">powered by <a href="https://subvind.com" class="svelte-8o1gnw">subvind</a></p></footer>`;
  }
}
