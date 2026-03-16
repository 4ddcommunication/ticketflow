<h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Interne Notiz hinzugefügt</h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    Hallo <?php echo esc_html($recipient_name); ?>,
</p>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    <?php echo esc_html($author_name); ?> hat eine interne Notiz zu Ticket <strong><?php echo esc_html($ticket_uid); ?></strong> hinzugefügt:
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border-radius:6px;padding:16px;margin:0 0 24px;border-left:3px solid #eab308;">
<tr><td>
    <p style="margin:0 0 4px;font-weight:600;color:#111827;">{{subject}}</p>
    <p style="margin:0;color:#374151;line-height:1.6;">{{note_preview}}</p>
</td></tr>
</table>

<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:12px 24px;">
    <a href="{{view_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Ticket anzeigen</a>
</td></tr>
</table>
