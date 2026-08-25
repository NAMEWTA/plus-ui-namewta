<template>
  <section class="identity-login" aria-labelledby="identity-login-title">
    <div class="identity-login__intro">
      <p class="identity-login__eyebrow">CLIENT WORKSPACE</p>
      <h1 id="identity-login-title">客户服务入口</h1>
      <p>登录客户工作台，查看服务资料并处理示例业务。</p>
    </div>

    <el-form class="identity-login__form" label-position="top" @submit.prevent="submit">
      <el-form-item label="用户名">
        <el-input v-model="form.username" name="username" autocomplete="username" :disabled="!ready || submitting" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="current-password"
          show-password
          :disabled="!ready || submitting"
        />
      </el-form-item>
      <el-form-item v-if="verification?.captchaEnabled" label="验证码">
        <el-input v-model="form.code" name="code" :disabled="!ready || submitting" />
      </el-form-item>
      <p v-if="errorMessage" class="identity-login__error" role="alert">{{ errorMessage }}</p>
      <el-button
        class="identity-login__submit"
        type="primary"
        native-type="submit"
        :loading="submitting"
        :disabled="!ready"
      >
        登录
      </el-button>
      <p class="identity-login__status" aria-live="polite">
        {{ ready ? '入口已就绪' : '正在检查入口状态' }}
      </p>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import type { LoginVerification } from '@namewta/domain-identity-access';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import type { IdentityAccessWebRuntime } from '../runtime';
import { requireIdentityAccessWebRuntime } from '../runtime';

const props = defineProps<{ runtime: IdentityAccessWebRuntime }>();
const runtime = requireIdentityAccessWebRuntime(props.runtime);
const ready = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const verification = ref<LoginVerification>();
const form = reactive({ username: '', password: '', code: '' });
let active = true;

const messageFor = (error: unknown) =>
  error instanceof Error && error.message ? error.message : '登录请求失败，请稍后重试';

const submit = async () => {
  if (!ready.value || submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    const session = await runtime.service.login({
      username: form.username,
      password: form.password,
      ...(form.code ? { code: form.code } : {}),
      ...(verification.value?.uuid ? { uuid: verification.value.uuid } : {})
    });
    if (active) await runtime.onAuthenticated(session);
  } catch (error) {
    if (active) errorMessage.value = messageFor(error);
  } finally {
    if (active) submitting.value = false;
  }
};

onMounted(async () => {
  try {
    const preparation = await runtime.service.prepareLogin();
    if (!active) return;
    verification.value = preparation.verification;
    ready.value = true;
  } catch (error) {
    if (active) errorMessage.value = messageFor(error);
  }
});

onUnmounted(() => {
  active = false;
});
</script>

<style scoped>
.identity-login {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 390px);
  gap: 48px;
  align-items: center;
  min-height: calc(100vh - 164px);
}

.identity-login__intro h1 {
  margin: 10px 0 14px;
  color: var(--client-text);
  font-size: 46px;
  line-height: 1.12;
}

.identity-login__intro p:last-child {
  max-width: 560px;
  color: var(--client-text-muted);
  line-height: 1.8;
}

.identity-login__eyebrow {
  margin: 0;
  color: var(--client-accent-strong);
  font-size: 12px;
  font-weight: 700;
}

.identity-login__form {
  padding: 30px;
  border: 1px solid var(--client-line);
  border-radius: var(--client-radius);
  background: var(--client-surface);
  box-shadow: var(--client-shadow);
}

.identity-login__submit {
  width: 100%;
  min-height: 42px;
}

.identity-login__error {
  color: #b42318;
  font-size: 14px;
}

.identity-login__status {
  margin: 16px 0 0;
  color: var(--client-text-muted);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 760px) {
  .identity-login {
    grid-template-columns: 1fr;
    gap: 28px;
    min-height: auto;
  }

  .identity-login__intro h1 {
    font-size: 36px;
  }
}
</style>
