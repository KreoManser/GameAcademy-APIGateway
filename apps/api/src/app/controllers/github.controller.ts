import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('github')
export class GithubController {
  constructor(private readonly configService: ConfigService) {}

  @Get('login')
  async githubLogin(@Res() res) {
    // 1. Редиректим на GitHub
    const clientId = this.configService.get('GITHUB_CLIENT_ID');
    const redirectUri = this.configService.get('GITHUB_REDIRECT_URI');
    const scope = 'repo user';
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    return res.redirect(url);
  }

  @Get('callback')
  async githubCallback(@Query('code') code: string, @Res() res, @Req() req) {
    // 2. Обмениваем code на access_token
    const clientId = this.configService.get('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get('GITHUB_CLIENT_SECRET');
    const redirectUri = this.configService.get('GITHUB_REDIRECT_URI');

    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const tokenData = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    };

    try {
      const resp = await axios.post(tokenUrl, tokenData, {
        headers: { Accept: 'application/json' },
      });
      const { access_token } = resp.data;

      // 3. Привязываем этот access_token к userId.
      //   - userId можно определить из JWT (req.user), если юзер залогинен
      //   - Или хранить в сессии
      const userId = req.user?.id || '???';

      // Сохраним в Mongo/BД (упрощённо):
      // this.userService.saveGithubToken(userId, access_token);

      // 4. Редиректим на фронт, где напишем "Вы успешно привязали GitHub!"
      return res.redirect(`https://your-frontend.com/github-success?tokenSaved=true`);
    } catch (err) {
      console.error('GitHub OAuth Error', err);
      return res.redirect(`https://your-frontend.com/github-fail?error=1`);
    }
  }
}
