<h2 style="margin:0 0 16px;font-size:18px;color:#111827;"><?php esc_html_e('Your Login Link', 'ticketflow'); ?></h2>

<p style="margin:0 0 12px;color:#374151;line-height:1.6;">
    <?php printf(esc_html__('Hi %s,', 'ticketflow'), esc_html($client_name)); ?>
</p>

<p style="margin:0 0 24px;color:#374151;line-height:1.6;">
    <?php esc_html_e('Click the button below to log in to your support portal. This link expires in 15 minutes.', 'ticketflow'); ?>
</p>

<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="background:#4f46e5;border-radius:6px;padding:14px 32px;">
    <a href="{{magic_url}}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;"><?php esc_html_e('Log In to Portal', 'ticketflow'); ?></a>
</td></tr>
</table>

<p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
    <?php esc_html_e('If the button doesn\'t work, copy and paste this URL into your browser:', 'ticketflow'); ?>
</p>
<p style="margin:0 0 16px;word-break:break-all;color:#4f46e5;font-size:13px;">
    {{magic_url}}
</p>

<p style="margin:0;color:#9ca3af;font-size:12px;">
    <?php esc_html_e('If you did not request this link, you can safely ignore this email.', 'ticketflow'); ?>
</p>
