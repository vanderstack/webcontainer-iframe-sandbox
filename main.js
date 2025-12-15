import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;
let isContainerBooted = false;
let parentIsReady = false; // Flag to remember if the parent has sent INIT

const statusEl = document.getElementById('status');

// Function to reply to the parent if both sides are ready
function attemptHandshakeReply() {
  if (isContainerBooted && parentIsReady) {
    console.log('[Iframe] Both sides ready. Sending IFRAME_READY.');
    statusEl.textContent = 'Handshake complete. Ready for commands.';
    statusEl.className = 'success';
    parent.postMessage({ type: 'IFRAME_READY' }, '*'); // Use specific origin in production
  }
}

async function initialize() {
  try {
    statusEl.textContent = 'Booting WebContainer...';
    console.log('[Iframe] Booting WebContainer...');
    webcontainerInstance = await WebContainer.boot();
    
    // The container is now ready.
    isContainerBooted = true;
    console.log('[Iframe] WebContainer booted.');
    
    // Check if the parent sent an INIT while we were booting.
    attemptHandshakeReply();

  } catch (error) {
    console.error('[Iframe] WebContainer boot failed:', error);
    statusEl.textContent = `ERROR: ${error.message}`;
    statusEl.className = 'error';
    parent.postMessage({ type: 'IFRAME_BOOT_ERROR', error: error.message }, '*');
  }
}

async function handleCommand(command, args) {
  if (!webcontainerInstance) return;
  const process = await webcontainerInstance.spawn(command, args);
  process.output.pipeTo(new WritableStream({
    write(data) {
      parent.postMessage({ type: 'EXECUTION_LOG', log: data }, '*');
    }
  }));
  const exitCode = await process.exit;
  parent.postMessage({ type: 'EXECUTION_RESULT', exitCode }, '*');
}

// Main event listener
window.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT':
      // The parent is ready. Set the flag.
      parentIsReady = true;
      console.log('[Iframe] Received INIT signal from parent.');
      
      // Check if we are also ready to reply.
      attemptHandshakeReply();
      break;

    case 'EXECUTE_COMMAND':
      handleCommand(payload.command, payload.args);
      break;
  }
});

// Start the boot process immediately
initialize();
