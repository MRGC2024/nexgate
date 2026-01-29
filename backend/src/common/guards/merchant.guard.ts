import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class MerchantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    const merchantId = request.params?.merchantId || request.body?.merchantId;
    if (!merchantId) return true;
    if (user.type === 'api_key' && user.merchantId !== merchantId) throw new ForbiddenException('Merchant não autorizado');
    if (user.merchantId && user.merchantId !== merchantId) throw new ForbiddenException('Merchant não autorizado');
    return true;
  }
}
