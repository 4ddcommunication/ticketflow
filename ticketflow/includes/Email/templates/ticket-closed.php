<h2 style="margin:0 0 16px;font-size:18px;color:#111827;"><?php esc_html_e('Ticket Closed', 'ticketflow'); ?></h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    <?php printf(esc_html__('Hi %s,', 'ticketflow'), esc_html($client_name)); ?>
</p>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    <?php printf(esc_html__('Ticket %s has been closed.', 'ticketflow'), '<strong>' . esc_html($ticket_uid) . '</strong>'); ?>
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:16px;margin:0 0 24px;">
<tr><td>
    <p style="margin:0 0 4px;font-weight:600;color:#111827;">{{subject}}</p>
    <p style="margin:0;color:#059669;font-weight:600;"><?php esc_html_e('Closed', 'ticketflow'); ?></p>
</td></tr>
</table>

<p style="margin:0 0 16px;color:#374151;line-height:1.6;">
    <?php esc_html_e('If you need further assistance, you can reopen this ticket from the portal.', 'ticketflow'); ?>
</p>

<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:12px 24px;">
    <a href="{{portal_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;"><?php esc_html_e('View in Portal', 'ticketflow'); ?></a>
</td></tr>
</table>
