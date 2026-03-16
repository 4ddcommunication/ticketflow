<h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Ticket zugewiesen</h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    Hallo <?php echo esc_html($agent_name); ?>,
</p>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    Dir wurde ein Ticket zugewiesen.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:16px;margin:0 0 24px;">
<tr><td>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Ticket-Details</p>
    <p style="margin:0 0 4px;font-weight:600;color:#111827;">
        {{ticket_uid}} — {{subject}}
        <span style="display:inline-block;margin-left:8px;padding:2px 8px;font-size:12px;font-weight:600;border-radius:4px;color:<?php echo esc_attr($priority['color']); ?>;background:<?php echo esc_attr($priority['bg']); ?>;"><?php echo esc_html($priority['label']); ?></span>
    </p>
    <p style="margin:0;color:#6b7280;font-size:14px;">Kunde: <?php echo esc_html($client_name); ?></p>
</td></tr>
</table>

<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:12px 24px;">
    <a href="{{admin_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Ticket anzeigen</a>
</td></tr>
</table>
