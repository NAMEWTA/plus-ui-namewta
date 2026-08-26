import type { Identifier } from '@namewta/domain-operations';
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
  const intent = runtime.service.attachmentIntent(
    authorization.url,
    runtime.hasPermission('system:notify:query'),
    authorization.fileName
  );
  await runtime.openDownload(intent);
}
