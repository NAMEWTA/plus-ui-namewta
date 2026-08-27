import { MonitorSecurityError, type Identifier, type NavigationIntent } from '@namewta/domain-system/monitor';
import type { MonitorWebRuntime } from './runtime';

export async function downloadNotificationAttachment(
  runtime: MonitorWebRuntime,
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
    if (!(error instanceof MonitorSecurityError)) throw error;
    runtime.error(error.message);
    return;
  }
  await runtime.openDownload(intent);
}
