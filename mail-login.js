(function () {
    const passwordDigest = '6b4a17f066948549d8cb7003790dbd677598b3ffb75e9fa0747187e68e9a9331';
    const sessionKey = 'mail-tool-authenticated';
    let isAuthenticated = false;

    try {
        isAuthenticated = sessionStorage.getItem(sessionKey) === 'true';
    } catch (error) {
        console.error('ログイン状態を確認できませんでした。', error);
    }

    if (isAuthenticated) return;

    document.documentElement.style.visibility = 'hidden';
    document.addEventListener('DOMContentLoaded', function () {
        const style = document.createElement('style');
        style.textContent = `
            #mail-tool-login-gate {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: grid;
                place-items: center;
                padding: 16px;
                background: #f0f2f5;
                font-family: "Meiryo", sans-serif;
            }
            #mail-tool-login-gate * { box-sizing: border-box; }
            .mail-tool-login-panel {
                width: min(380px, 100%);
                padding: 28px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
            }
            .mail-tool-login-panel h1 { margin: 0 0 8px; font-size: 1.25rem; color: #333; }
            .mail-tool-login-panel p { margin: 0 0 18px; color: #666; font-size: 0.9rem; }
            .mail-tool-login-panel label { display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: bold; }
            .mail-tool-login-panel input {
                width: 100%;
                padding: 10px;
                border: 1px solid #bbb;
                border-radius: 4px;
                font: inherit;
            }
            .mail-tool-login-panel button {
                width: 100%;
                margin-top: 12px;
                padding: 10px;
                border: 0;
                border-radius: 4px;
                background: #0056b3;
                color: #fff;
                font: inherit;
                font-weight: bold;
                cursor: pointer;
            }
            .mail-tool-login-panel button:disabled { opacity: 0.65; cursor: wait; }
            #mail-tool-login-status { min-height: 1.4em; margin: 10px 0 0; color: #b00020; font-size: 0.85rem; }
        `;
        document.head.appendChild(style);

        const gate = document.createElement('div');
        gate.id = 'mail-tool-login-gate';
        gate.innerHTML = `
            <form class="mail-tool-login-panel">
                <h1>メール作成ツール</h1>
                <p>利用するにはパスワードを入力してください。</p>
                <label for="mail-tool-password">パスワード</label>
                <input id="mail-tool-password" type="password" autocomplete="current-password" required>
                <button type="submit">ログイン</button>
                <p id="mail-tool-login-status" role="alert" aria-live="polite"></p>
            </form>
        `;
        document.body.appendChild(gate);
        document.documentElement.style.visibility = 'visible';

        const form = gate.querySelector('form');
        const passwordInput = gate.querySelector('#mail-tool-password');
        const submitButton = form.querySelector('button');
        const status = gate.querySelector('#mail-tool-login-status');
        passwordInput.focus();

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            submitButton.disabled = true;
            status.textContent = '';

            try {
                const data = new TextEncoder().encode(passwordInput.value);
                const digestBuffer = await crypto.subtle.digest('SHA-256', data);
                const digest = Array.from(new Uint8Array(digestBuffer), byte =>
                    byte.toString(16).padStart(2, '0')).join('');

                if (digest !== passwordDigest) {
                    status.textContent = 'パスワードが違います。';
                    passwordInput.value = '';
                    passwordInput.focus();
                    return;
                }

                sessionStorage.setItem(sessionKey, 'true');
                window.location.reload();
            } catch (error) {
                console.error('ログイン処理に失敗しました。', error);
                status.textContent = 'ログインできませんでした。ブラウザーの設定をご確認ください。';
            } finally {
                submitButton.disabled = false;
            }
        });
    });
})();
