import { OperationsSecurityError, type Identifier, type NavigationIntent } from '@namewta/domain-operations';
import type { OperationsWebRuntime } from './runtime';

export async function downloadNotificationAttachment(
  runtime: OperationsWebRuntime,
  notifyLogId: Identifier,
  ossId: Identifier
) {
  const response = await runtime.service.notifications.attachmentUrl(notifyLogId, ossId);
  const authorization = response.data;
  if (!authorization?.url) {
    runtime.error('未取得附件下载授权');
    return;
  }
  let intent: NavigationIntent;
  try {
    intent = runtime.service.attachmentIntent(
      authorization.url,
      runtime.hasPermission('system:notify:query'),
      authorization.fileName
    );
  } catch (error) {
    if (!(error instanceof OperationsSecurityError)) throw error;
    runtime.error(error.message);
    return;
  }
  await runtime.openDownload(intent);
}
