import { withDevGuard } from '@utils/withDevGuard.js';

function renderMobiletestPage(container) {
  container.innerHTML = `
    <div class="p-6">
      <h1 class="text-3xl font-bold">Mobletest Playground</h1>
      <p>This page is visible only to ${import.meta.env.DEV ? 'dev mode' : 'the dev account'}.</p>
    </div>
  `;
}

export default withDevGuard(renderMobiletestPage);
