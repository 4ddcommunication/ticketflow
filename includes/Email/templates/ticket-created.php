<h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Dein Ticket wurde erstellt</h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    Hallo <?php echo esc_html($client_name); ?>,
</p>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    Wir haben deine Anfrage erhalten und unser Team wird sich in Kürze bei dir melden.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:16px;margin:0 0 24px;">
<tr><td>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Ticket</p>
    <p style="margin:0 0 4px;font-weight:600;color:#111827;">{{ticket_uid}}</p>
    <p style="margin:0;color:#374151;">{{subject}}</p>
</td></tr>
</table>

<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:12px 24px;">
    <a href="{{portal_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Im Portal anzeigen</a>
</td></tr>
</table>
