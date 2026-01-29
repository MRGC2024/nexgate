import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { JwtPayload } from '../decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeysService: ApiKeysService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const publicKey = request.headers['x-api-key'] as string;
    const secretKey = request.headers['x-api-secret'] as string;

    if (publicKey && secretKey) {
      const result = await this.apiKeysService.validateKey(publicKey, secretKey);
      if (!result) throw new UnauthorizedException('API Key inválida');
      request.user = {
        sub: result.merchantId,
        email: '',
        merchantId: result.merchantId,
        roles: ['merchant_api'],
        type: 'api_key',
      } as JwtPayload;
      return true;
    }

    throw new UnauthorizedException('X-API-Key e X-API-Secret obrigatórios para esta rota');
  }
}
