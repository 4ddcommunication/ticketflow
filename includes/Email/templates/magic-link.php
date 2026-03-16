<h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Dein Login-Link</h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    Hallo <?php echo esc_html($client_name); ?>,
</p>

<p style="margin:0 0 24px;color:#374151;line-height:1.6;">
    Klicke auf den Button, um dich im Support-Portal anzumelden. Der Link ist 15 Minuten gültig.
</p>

<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:14px 32px;">
    <a href="{{magic_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Zum Portal anmelden</a>
</td></tr>
</table>

<p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
    Falls der Button nicht funktioniert, kopiere diese URL in deinen Browser:
</p>
<p style="margin:0 0 16px;word-break:break-all;color:#4f46e5;font-size:13px;">
    {{magic_url}}
</p>

<p style="margin:0;color:#9ca3af;font-size:12px;">
    Falls du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.
</p>
