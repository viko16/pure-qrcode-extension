(async function main() {
  const currentUrl = await getCurrentPageUrl();
  const u = new URL(currentUrl);

  // replace locally hostname to IP
  const locallyHostNames = ['localhost', '127.0.0.1', '0.0.0.0'];
  if (locallyHostNames.includes(u.hostname)) {
    u.hostname = await getLocalIP();;
  }

  const finalUrl = u.href;

  // show url and QR code
  document.getElementById('url').innerText = finalUrl;
  new QRious({
    element: document.querySelector('canvas'),
    value: finalUrl,
    size: 350,
  });

  document.getElementById('copy').addEventListener('click', () => {
    navigator.clipboard.writeText(finalUrl).then(() => {
      window.close();
    });
  });
})();

// from https://stackoverflow.com/a/29514292
function getLocalIP() {
  return new Promise(resolve => {
    const ips = [];

    const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    const pc = new RTCPeerConnection({
      // Don't specify any stun/turn servers, otherwise you will
      // also find your public IP addresses.
      iceServers: [],
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel('');

    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function(e) {
      if (!e.candidate) {
        // Candidate gathering completed.
        pc.close();
        resolve(ips[0]);
        return;
      }
      const ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
      if (ips.indexOf(ip) == -1)
        // avoid duplicate entries (tcp/udp)
        ips.push(ip);
    };
    pc.createOffer(
      function(sdp) {
        pc.setLocalDescription(sdp);
      },
      function onerror() {}
    );
  })
}

function getCurrentPageUrl() {
  return new Promise(resolve => {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true, currentWindow: true },
      tabs => {
        const { url } = tabs[0];
        resolve(url);
      }
    );
  });
}
