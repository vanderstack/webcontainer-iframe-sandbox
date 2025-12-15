import { WebContainer } from 'https://esm.sh/@webcontainer/api';

// This will hold the single WebContainer instance.
let webcontainerInstance;

// This function boots the container and sends the ready message.
async function initialize() {
  try {
    console.log('[Iframe] Booting WebContainer...');
    webcontainerInstance = await WebContainer.boot();
    console.log('[Iframe] WebContainer booted. Sending IFRAME_READY.');
    parent.postMessage({ type: 'IFRAME_READY' }, '*'); // Use a specific origin in production
  } catch (error) {
    console.error('[Iframe] WebContainer boot failed:', error);
    parent.postMessage({ type: 'IFRAME_BOOT_ERROR', error: error.message }, '*');
  }
}

// This function handles incoming commands.
async function handleCommand(command, args) {
  if (!webcontainerInstance) {
    console.error('[Iframe] Cannot execute command, container not ready.');
    return;
  }

  console.log(`[Iframe] Spawning command: ${command} ${args.join(' ')}`);
  const process = await webcontainerInstance.spawn(command, args);

  // Stream the output back to the parent window.
  process.output.pipeTo(new WritableStream({
    write(data) {
      parent.postMessage({ type: 'EXECUTION_LOG', log: data }, '*');
    }
  }));

  // When the process finishes, send the final exit code.
  const exitCode = await process.exit;
  parent.postMessage({ type: 'EXECUTION_RESULT', exitCode }, '*');
}

// Listen for messages from the parent window.
window.addEventListener('message', (event) => {
  // IMPORTANT: Add origin validation in a real app for security
  // if (event.origin !== 'https://your-app-domain.com') return;

  if (event.data.type === 'EXECUTE_COMMAND') {
    const { command, args } = event.data.payload;
    handleCommand(command, args);
  }
});

// Start the boot process as soon as the script loads.
initialize();
