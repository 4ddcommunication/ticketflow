<h2 style="margin:0 0 16px;font-size:18px;color:#111827;"><?php esc_html_e('Your Ticket Has Been Created', 'ticketflow'); ?></h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    <?php printf(esc_html__('Hi %s,', 'ticketflow'), esc_html($client_name)); ?>
</p>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    <?php esc_html_e('We\'ve received your support request and a member of our team will be in touch soon.', 'ticketflow'); ?>
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:16px;margin:0 0 24px;">
<tr><td>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;"><?php esc_html_e('Ticket', 'ticketflow'); ?></p>
    <p style="margin:0 0 4px;font-weight:600;color:#111827;">{{ticket_uid}}</p>
    <p style="margin:0;color:#374151;">{{subject}}</p>
</td></tr>
</table>

<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:12px 24px;">
    <a href="{{portal_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;"><?php esc_html_e('View in Portal', 'ticketflow'); ?></a>
</td></tr>
</table>
