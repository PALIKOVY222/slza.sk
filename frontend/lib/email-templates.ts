/**
 * Email Templates for SLZA Print
 * Professional HTML email templates with responsive design
 */

export const EmailTemplates = {
  /**
   * Newsletter Welcome Email Template
   */
  newsletterWelcome: (subscriberEmail: string) => ({
    subject: '🎉 Vitajte v SLZA Print newsletteri!',
    html: `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vitajte v SLZA Print</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0087E3 0%, #0056b3 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                SLZA Print
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Profesionálna digitálna tlač
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: bold;">
                Ďakujeme za prihlásenie! 🎉
              </h2>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Ahoj! Vitaj v našej komunite! Tešíme sa, že si sa rozhodol/rozhodla ostať s nami v kontakte.
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #0087E3; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: bold;">
                  Čo ťa čaká v našom newsletteri?
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                  <li><strong>🆕 Novinky a nové produkty</strong> – prvý sa dozvi o novinkách</li>
                  <li><strong>💰 Exkluzívne zľavy</strong> – špeciálne ceny len pre odberateľov</li>
                  <li><strong>💡 Tipy a rady</strong> – ako pripraviť súbory na tlač</li>
                  <li><strong>📦 Špeciálne akcie</strong> – limitované ponuky a kampane</li>
                  <li><strong>🎨 Inšpirácia</strong> – kreatívne nápady pre tvoje projekty</li>
                </ul>
              </div>

              <p style="margin: 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Ak potrebuješ niečo vytlačiť už teraz, navštív náš e-shop a objednaj si produkty s expresným spracovaním.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://slza.sk/produkty" style="display: inline-block; background: linear-gradient(135deg, #0087E3 0%, #0056b3 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 135, 227, 0.3);">
                      Prejsť do e-shopu →
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #e7f5ff; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #0056b3; font-size: 15px; font-weight: bold;">
                  🎁 Bonus pre nových odberateľov
                </p>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                  Sleduj náš prvý newsletter – pripravujeme pre teba špeciálnu zľavu na prvú objednávku!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: bold;">
                Potrebuješ pomoc?
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 15px 0;">
                <tr>
                  <td align="center">
                    <a href="https://slza.sk" style="color: #0087E3; text-decoration: none; margin: 0 15px; font-size: 14px;">
                      🌐 Webová stránka
                    </a>
                    <a href="https://slza.sk/kontakt" style="color: #0087E3; text-decoration: none; margin: 0 15px; font-size: 14px;">
                      📧 Kontakt
                    </a>
                    <a href="https://slza.sk/produkty" style="color: #0087E3; text-decoration: none; margin: 0 15px; font-size: 14px;">
                      🛒 E-shop
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                <strong>SLZA Print s.r.o.</strong><br>
                Profesionálna digitálna tlač<br>
                Email: <a href="mailto:info@slza.sk" style="color: #0087E3; text-decoration: none;">info@slza.sk</a>
              </p>

              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

              <p style="margin: 0; color: #868e96; font-size: 12px; line-height: 1.5;">
                Tento email bol odoslaný na adresu <strong>${subscriberEmail}</strong> pretože si sa prihlásil/prihlásila na náš newsletter.<br>
                Ak si už nechceš prijímať naše správy, <a href="https://slza.sk/kontakt" style="color: #0087E3; text-decoration: none;">kontaktuj nás</a>.
              </p>

              <p style="margin: 15px 0 0; color: #adb5bd; font-size: 11px;">
                © ${new Date().getFullYear()} SLZA Print s.r.o. Všetky práva vyhradené.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  /**
   * Contact Form Notification Email Template (to admin)
   */
  contactNotification: (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => ({
    subject: `📬 Nová správa z kontaktného formulára - ${data.name}`,
    html: `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nová správa</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0087E3; padding: 20px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                📬 Nová správa z kontaktného formulára
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
                    <table cellpadding="8" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="120" style="font-weight: bold; color: #495057; font-size: 14px;">Meno:</td>
                        <td style="color: #212529; font-size: 15px;">${data.name}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #495057; font-size: 14px;">Email:</td>
                        <td style="color: #212529; font-size: 15px;">
                          <a href="mailto:${data.email}" style="color: #0087E3; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                      ${data.phone ? `
                      <tr>
                        <td style="font-weight: bold; color: #495057; font-size: 14px;">Telefón:</td>
                        <td style="color: #212529; font-size: 15px;">
                          <a href="tel:${data.phone}" style="color: #0087E3; text-decoration: none;">${data.phone}</a>
                        </td>
                      </tr>
                      ` : ''}
                      ${data.subject ? `
                      <tr>
                        <td style="font-weight: bold; color: #495057; font-size: 14px;">Predmet:</td>
                        <td style="color: #212529; font-size: 15px;">${data.subject}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <div style="margin: 25px 0;">
                <p style="margin: 0 0 10px; font-weight: bold; color: #495057; font-size: 14px;">Správa:</p>
                <div style="background-color: #f8f9fa; border-left: 4px solid #0087E3; padding: 20px; border-radius: 4px;">
                  <p style="margin: 0; color: #212529; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                </div>
              </div>

              <!-- Quick Actions -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject || 'Kontakt z SLZA Print')}" 
                       style="display: inline-block; background-color: #0087E3; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: bold; margin: 0 5px;">
                      Odpovedať emailom
                    </a>
                    ${data.phone ? `
                    <a href="tel:${data.phone}" 
                       style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: bold; margin: 0 5px;">
                      Zavolať
                    </a>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 13px;">
                Odoslané cez kontaktný formulár na <a href="https://slza.sk" style="color: #0087E3; text-decoration: none;">slza.sk</a><br>
                ${new Date().toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' })}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  /**
   * Contact Form Confirmation Email Template (to customer)
   */
  contactConfirmation: (customerName: string) => ({
    subject: '✅ Potvrdenie prijatia správy - SLZA Print',
    html: `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potvrdenie správy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #28a745 0%, #20883b 100%); padding: 30px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Správa prijatá!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 18px;">
                Ahoj <strong>${customerName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Ďakujeme za tvoju správu! Potvrdujeme, že sme ju úspešne prijali a čoskoro sa ti ozveme.
              </p>

              <div style="background-color: #e7f5ff; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px; color: #0056b3; font-size: 15px; font-weight: bold;">
                  ⏱️ Čo ďalej?
                </p>
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                  Náš tím ti odpovie v najbližších <strong>24 hodinách</strong> (v pracovných dňoch). 
                  V prípade naliehavých záležitostí nás môžeš kontaktovať telefonicky.
                </p>
              </div>

              <p style="margin: 20px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                Medzitým sa môžeš pozrieť na naše produkty a služby:
              </p>

              <!-- Product Links -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; text-align: center; margin-bottom: 10px;">
                    <a href="https://slza.sk/produkty" style="color: #0087E3; text-decoration: none; font-weight: bold; font-size: 15px;">
                      🖨️ Tlačové služby
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; text-align: center; margin-bottom: 10px;">
                    <a href="https://slza.sk/produkty" style="color: #0087E3; text-decoration: none; font-weight: bold; font-size: 15px;">
                      📦 Cenník produktov
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: bold;">
                Kontaktné informácie
              </p>
              
              <p style="margin: 0 0 10px; color: #555555; font-size: 14px;">
                📧 Email: <a href="mailto:info@slza.sk" style="color: #0087E3; text-decoration: none;">info@slza.sk</a>
              </p>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 14px;">
                🌐 Web: <a href="https://slza.sk" style="color: #0087E3; text-decoration: none;">slza.sk</a>
              </p>

              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

              <p style="margin: 0; color: #868e96; font-size: 12px;">
                S pozdravom,<br>
                <strong>Tím SLZA Print</strong>
              </p>

              <p style="margin: 15px 0 0; color: #adb5bd; font-size: 11px;">
                © ${new Date().getFullYear()} SLZA Print s.r.o. Všetky práva vyhradené.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
};
