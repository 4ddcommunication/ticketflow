<h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Ticket geschlossen</h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    Hallo <?php echo esc_html($client_name); ?>,
</p>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    Ticket <strong><?php echo esc_html($ticket_uid); ?></strong> wurde geschlossen.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:16px;margin:0 0 24px;">
<tr><td>
    <p style="margin:0 0 4px;font-weight:600;color:#111827;">{{subject}}</p>
    <p style="margin:0;color:#059669;font-weight:600;">Geschlossen</p>
</td></tr>
</table>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    Falls du weitere Unterstützung benötigst, kannst du dieses Ticket im Portal erneut öffnen.
</p>

<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:12px 24px;">
    <a href="{{portal_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Im Portal anzeigen</a>
</td></tr>
</table>
