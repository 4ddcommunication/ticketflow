const de: Record<string, string> = {
    // Common
    'Loading': 'Laden',
    'Save': 'Speichern',
    'Saving...': 'Wird gespeichert...',
    'Cancel': 'Abbrechen',
    'Create': 'Erstellen',
    'Creating...': 'Wird erstellt...',
    'Edit': 'Bearbeiten',
    'Delete': 'Löschen',
    'Update': 'Aktualisieren',
    'Search': 'Suchen',
    'Back': 'Zurück',
    'View all': 'Alle anzeigen',
    'Unassigned': 'Nicht zugewiesen',
    'Sending...': 'Wird gesendet...',
    'System': 'System',
    'from': 'von',
    'to': 'zu',
    'Internal': 'Intern',

    // Statuses
    'Open': 'Offen',
    'In Progress': 'In Bearbeitung',
    'Waiting': 'Wartend',
    'Resolved': 'Gelöst',
    'Closed': 'Geschlossen',

    // Status descriptions
    'Not yet picked up': 'Noch nicht in Bearbeitung',
    'Agent working on it': 'Agent arbeitet daran',
    'Awaiting client response': 'Wartet auf Kundenantwort',
    'Pending confirmation': 'Wartet auf Bestätigung',
    'No action needed': 'Keine Aktion erforderlich',

    // Priorities
    'Low': 'Niedrig',
    'Normal': 'Normal',
    'High': 'Hoch',
    'Urgent': 'Dringend',

    // Sidebar
    'Dashboard': 'Dashboard',
    'Tickets': 'Tickets',
    'Clients': 'Kunden',
    'Settings': 'Einstellungen',
    'Logout': 'Abmelden',

    // Dashboard
    'Total Tickets': 'Tickets gesamt',
    'My Queue': 'Meine Warteschlange',
    'Recent Tickets': 'Aktuelle Tickets',
    'No tickets yet.': 'Noch keine Tickets.',

    // Ticket List (Admin)
    'New Ticket': 'Neues Ticket',
    'Ticket': 'Ticket',
    'Client': 'Kunde',
    'Agent': 'Agent',
    'Status': 'Status',
    'Priority': 'Priorität',
    'Updated': 'Aktualisiert',
    'No tickets found.': 'Keine Tickets gefunden.',

    // Filters
    'Search tickets...': 'Tickets suchen...',
    'All Statuses': 'Alle Status',
    'All Priorities': 'Alle Prioritäten',
    'Clear filters': 'Filter zurücksetzen',

    // Client Detail
    'Back to clients': 'Zurück zu Kunden',
    'Client not found.': 'Kunde nicht gefunden.',
    'Contact': 'Kontakt',
    'Contacts': 'Kontakte',

    // Ticket Detail
    'Back to tickets': 'Zurück zu Tickets',
    'Ticket not found.': 'Ticket nicht gefunden.',
    'Assigned To': 'Zugewiesen an',
    'Category': 'Kategorie',
    'Created': 'Erstellt',
    'SLA Deadline': 'SLA-Frist',
    'Activity': 'Aktivität',

    // Reply Composer
    'Write a reply...': 'Antwort schreiben...',
    'Add internal note...': 'Interne Notiz hinzufügen...',
    'Internal note': 'Interne Notiz',
    'Reply': 'Antworten',
    'Add Note': 'Notiz hinzufügen',

    // Activity
    'No activity yet.': 'Noch keine Aktivität.',
    'Created the ticket': 'Ticket erstellt',
    'Added a reply': 'Antwort hinzugefügt',
    'Added an internal note': 'Interne Notiz hinzugefügt',
    'Changed status': 'Status geändert',
    'Changed priority': 'Priorität geändert',
    'Changed assignment': 'Zuweisung geändert',

    // File Uploader
    'Attach file': 'Datei anhängen',
    'Upload failed': 'Upload fehlgeschlagen',
    'File exceeds {size}MB limit': 'Datei überschreitet {size}MB Limit',

    // Pagination
    '{count} result': '{count} Ergebnis',
    '{count} results': '{count} Ergebnisse',
    'Prev': 'Zurück',
    'Next': 'Weiter',

    // Clients Page
    'Add Client': 'Kunde hinzufügen',
    'Name': 'Name',
    'Email': 'E-Mail',
    'Failed to create client': 'Kunde konnte nicht erstellt werden',
    'No clients found.': 'Keine Kunden gefunden.',
    'Search clients...': 'Kunden suchen...',
    'Joined': 'Beigetreten',
    'Add Client hint': 'Kunde hinzufügen — erstellt ein WP-Konto mit der Rolle subscriber oder ticketflow_client',
    'Login hint': 'Login — Kunden erhalten einen Magic Link per E-Mail, kein Passwort nötig',
    'Staff roles hint': 'Mitarbeiterrollen — ticketflow_agent oder ticketflow_admin unter WP Benutzer vergeben',
    'Permissions hint': 'Berechtigungen — Kunden sehen nur ihre eigenen Tickets, Agenten und Admins sehen alle',

    // Settings Page
    'General': 'Allgemein',
    'Active': 'Aktiv',
    'Export Ticket': 'Ticket exportieren',
    'Exporting...': 'Exportiert...',
    'Company': 'Firma',
    'Company Name': 'Firmenname',
    'optional': 'optional',
    'Portal Accent Color': 'Portal-Akzentfarbe',
    'Accent color hint': 'Wird auf das Kundenportal und die E-Mail-Vorlagen angewendet',
    'Ticket Categories': 'Ticket-Kategorien',
    'Categories description': 'Wenn ein Kunde ein neues Ticket erstellt, muss er eine dieser Kategorien auswählen. Das hilft Ihrem Team bei der Sortierung und Weiterleitung. Trennen Sie die Kategorien mit Kommas.',
    'Categories': 'Kategorien',
    'Categories example': 'Beispiel: Abrechnung, Technischer Support, Konto, Allgemeine Anfrage',
    'Service Level Agreement (SLA)': 'Service Level Agreement (SLA)',
    'SLA description': 'SLA definiert die maximale Zeit, die Ihr Team hat, um auf Tickets zu antworten und sie zu lösen. Überschrittene Fristen werden in der Ticketliste markiert. Auto-Schließen entfernt gelöste Tickets, die keine Aktivität für den konfigurierten Zeitraum hatten.',
    'Response Time (hours)': 'Antwortzeit (Stunden)',
    'Resolve Time (hours)': 'Lösungszeit (Stunden)',
    'Auto-close after (days)': 'Automatisch schließen nach (Tagen)',
    'From Name': 'Absendername',
    'From Email': 'Absender-E-Mail',
    'Enable email notifications': 'E-Mail-Benachrichtigungen aktivieren',
    'Files': 'Dateien',
    'Max File Size (MB)': 'Max. Dateigröße (MB)',
    'Allowed File Types (comma-separated)': 'Erlaubte Dateitypen (kommagetrennt)',
    'Save Settings': 'Einstellungen speichern',
    'Settings saved!': 'Einstellungen gespeichert!',

    // Saved Replies
    'Saved Replies': 'Gespeicherte Antworten',
    'New Reply': 'Neue Antwort',
    'Title': 'Titel',
    'Reply body...': 'Antworttext...',
    'Category (optional)': 'Kategorie (optional)',
    'No saved replies yet.': 'Noch keine gespeicherten Antworten.',
    'Used {count} times': '{count} Mal verwendet',
    'Delete this saved reply?': 'Diese gespeicherte Antwort löschen?',

    // Portal - Login
    'Support Portal': 'Support-Portal',
    'Check your email': 'E-Mail prüfen',
    'We sent a login link to {email}. It expires in 15 minutes.': 'Wir haben einen Login-Link an {email} gesendet. Er ist 15 Minuten gültig.',
    'Use a different email': 'Andere E-Mail verwenden',
    'Enter your email to receive a login link.': 'Geben Sie Ihre E-Mail-Adresse ein, um einen Login-Link zu erhalten.',
    'Send Login Link': 'Login-Link senden',
    'Something went wrong': 'Etwas ist schiefgelaufen',

    // Portal - Ticket List
    'My Tickets': 'Meine Tickets',
    "You haven't submitted any tickets yet.": 'Sie haben noch keine Tickets eingereicht.',
    'Create your first ticket': 'Erstellen Sie Ihr erstes Ticket',
    '{count} replies': '{count} Antworten',

    // Portal - New Ticket
    'Subject': 'Betreff',
    'Brief summary of your issue': 'Kurze Zusammenfassung Ihres Anliegens',
    'Select...': 'Auswählen...',
    'Description': 'Beschreibung',
    'Describe your issue in detail...': 'Beschreiben Sie Ihr Anliegen im Detail...',
    'Attachments': 'Anhänge',
    'Attach files': 'Dateien anhängen',
    '(PNG, JPEG, PDF, up to 10MB)': '(PNG, JPEG, PDF, bis zu 10MB)',
    'Submit Ticket': 'Ticket einreichen',
    'Submitting...': 'Wird eingereicht...',
    'Failed to create ticket': 'Ticket konnte nicht erstellt werden',
    'Uploading file {current} of {total}...': 'Datei {current} von {total} wird hochgeladen...',
    '"{name}" is not an allowed file type.': '„{name}" ist kein erlaubter Dateityp.',
    '"{name}" exceeds the 10MB limit.': '„{name}" überschreitet das 10MB-Limit.',

    // Portal - Ticket Detail
    'Staff': 'Mitarbeiter',
    'Support': 'Support',

    // Portal Header
    'Log out': 'Abmelden',
};

export default de;
