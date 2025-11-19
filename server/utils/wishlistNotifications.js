const User = require('../models/User');
const { sendMail } = require('./mailer');
const { sendSMSAndWhatsApp } = require('./smsService');

/**
 * Send email notifications to users who have a product in their wishlist
 * when the product becomes available (comingSoon -> available or outOfStock -> inStock)
 * 
 * @param {Object} product - The updated product
 * @param {Object} previousState - The previous state of the product
 */
exports.notifyWishlistUsers = async (product, previousState = {}) => {
  try {
    console.log('=== Wishlist Notification Check ===');
    console.log('Product:', product.name, 'ID:', product._id);
    console.log('Previous State:', {
      comingSoon: previousState.comingSoon,
      inStock: previousState.inStock,
      stockCount: previousState.stockCount,
      price: previousState.price
    });
    console.log('Current State:', {
      comingSoon: product.comingSoon,
      inStock: product.inStock,
      stockCount: product.stockCount,
      price: product.price
    });

    // Check if product state changed in a way that should trigger notifications
    // Coming Soon: either comingSoon flag was true OR price was null/undefined
    const wasComingSoon = previousState.comingSoon === true || 
                          previousState.price === null || 
                          previousState.price === undefined;
    
    // Out of Stock: inStock was false OR stockCount was 0
    const wasOutOfStock = previousState.inStock === false || 
                         (previousState.stockCount !== undefined && previousState.stockCount === 0 && previousState.inStock !== true);
    
    // Now Available: comingSoon is false AND price exists
    const isNowAvailable = product.comingSoon === false && 
                          product.price !== null && 
                          product.price !== undefined &&
                          typeof product.price === 'number' &&
                          product.price > 0;
    
    // Now In Stock: inStock is true AND (stockCount is undefined OR stockCount > 0)
    const isNowInStock = product.inStock === true && 
                        (product.stockCount === undefined || product.stockCount > 0);

    console.log('Detection:', {
      wasComingSoon,
      wasOutOfStock,
      isNowAvailable,
      isNowInStock
    });

    // Determine what changed
    let notificationType = null;
    let notificationMessage = '';

    // Case 1: Product was coming soon (no price) and now has price and is available
    if (wasComingSoon && isNowAvailable) {
      notificationType = 'coming_soon_available';
      notificationMessage = `Great news! "${product.name}" is now available for purchase!`;
      console.log('✅ Triggering: Coming Soon -> Available');
    } 
    // Case 2: Product was out of stock and now has stock
    else if (wasOutOfStock && isNowInStock) {
      notificationType = 'back_in_stock';
      notificationMessage = `Good news! "${product.name}" is back in stock!`;
      console.log('✅ Triggering: Out of Stock -> In Stock');
    }

    // Only send notifications if there's a relevant change
    if (!notificationType) {
      console.log('⏭️ Skipping: No relevant state change detected');
      return { sent: 0, skipped: true };
    }

    // Find all users who have this product in their wishlist
    const usersWithProductInWishlist = await User.find({
      wishlist: product._id,
      $or: [
        { email: { $exists: true, $ne: '' } }, // Users with valid email
        { phone: { $exists: true, $ne: '' } }   // OR users with valid phone
      ]
    }).select('email name phone countryCode phoneDialCode');

    console.log(`Found ${usersWithProductInWishlist.length} users with product in wishlist`);

    if (!usersWithProductInWishlist || usersWithProductInWishlist.length === 0) {
      console.log('⏭️ No users found with this product in wishlist');
      return { sent: 0, users: 0 };
    }

    // Prepare email content
    const productImage = product.imageUrl || (product.images && product.images[0]) || '/4.webp';
    const productPrice = product.price ? `Rs. ${product.price.toLocaleString()}` : 'Price available';
    const siteUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const productUrl = `${siteUrl}/product/${product._id}`;

    // Prepare SMS/WhatsApp message (shorter format)
    const smsMessage = `${notificationMessage}\n\nProduct: ${product.name}\nPrice: ${productPrice}\n\nView: ${productUrl}\n\n- Valora Gold`;

    // Send notifications to all users (Email, SMS, WhatsApp)
    const notificationPromises = usersWithProductInWishlist.map(async (user) => {
      try {
        const userName = user.name || 'Valued Customer';
        const userEmail = user.email;
        const userPhone = user.phone;
        const countryCode = user.countryCode;
        const phoneDialCode = user.phoneDialCode;
        
        const results = {
          email: false,
          sms: false,
          whatsapp: false
        };

        // Send Email
        if (userEmail && userEmail.trim()) {
          const subject = notificationType === 'coming_soon_available' 
            ? `🎉 "${product.name}" is Now Available!`
            : `✅ "${product.name}" is Back in Stock!`;
          
          console.log(`📧 Preparing email for ${userEmail}...`);

          const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Valora Gold</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">Hello ${userName}!</h2>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        ${notificationMessage}
                      </p>

                      ${notificationType === 'coming_soon_available' 
                        ? `<p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            The product you added to your wishlist is now available with a price and ready to purchase!
                          </p>`
                        : `<p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Stock has been added to the product you were waiting for. Don't miss out!
                          </p>`
                      }

                      <!-- Product Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; margin: 20px 0;">
                        <tr>
                          <td width="200" style="background-color: #f9f9f9; padding: 15px; vertical-align: top;">
                            <img src="${productImage}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 4px;" />
                          </td>
                          <td style="padding: 20px; vertical-align: top;">
                            <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${product.name}</h3>
                            <p style="color: #22c55e; font-size: 20px; font-weight: bold; margin: 10px 0;">${productPrice}</p>
                            ${product.originalPrice && product.originalPrice > product.price 
                              ? `<p style="color: #999999; font-size: 14px; margin: 5px 0; text-decoration: line-through;">Rs. ${product.originalPrice.toLocaleString()}</p>`
                              : ''
                            }
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${productUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              View Product
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        This email was sent because you added this product to your wishlist. 
                        <a href="${siteUrl}/wishlist" style="color: #22c55e; text-decoration: none;">Manage your wishlist</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Valora Gold. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
          `;

          const text = `
Hello ${userName}!

${notificationMessage}

${notificationType === 'coming_soon_available' 
  ? 'The product you added to your wishlist is now available with a price and ready to purchase!'
  : 'Stock has been added to the product you were waiting for. Don\'t miss out!'
}

Product: ${product.name}
Price: ${productPrice}
View Product: ${productUrl}

This email was sent because you added this product to your wishlist.
Manage your wishlist: ${siteUrl}/wishlist

© ${new Date().getFullYear()} Valora Gold. All rights reserved.
          `;

          const emailResult = await sendMail({
            to: userEmail,
            subject,
            html,
            text
          });

          if (emailResult) {
            console.log(`✅ Email sent successfully to ${userEmail}`);
            results.email = true;
          } else {
            console.log(`❌ Failed to send email to ${userEmail}`);
          }
        } else {
          console.log(`⏭️ Skipping email for user ${user._id}: No email address`);
        }

        // Send SMS and WhatsApp
        if (userPhone && userPhone.trim()) {
          try {
            const smsWhatsAppResult = await sendSMSAndWhatsApp(
              userPhone,
              countryCode,
              phoneDialCode,
              smsMessage
            );

            if (smsWhatsAppResult.sms) {
              console.log(`✅ SMS sent successfully to ${smsWhatsAppResult.phone}`);
              results.sms = true;
            } else {
              console.log(`❌ Failed to send SMS to ${smsWhatsAppResult.phone || userPhone}`);
            }

            if (smsWhatsAppResult.whatsapp) {
              console.log(`✅ WhatsApp sent successfully to ${smsWhatsAppResult.phone}`);
              results.whatsapp = true;
            } else {
              console.log(`❌ Failed to send WhatsApp to ${smsWhatsAppResult.phone || userPhone}`);
            }
          } catch (error) {
            console.error(`❌ Error sending SMS/WhatsApp to ${userPhone}:`, error.message);
          }
        } else {
          console.log(`⏭️ Skipping SMS/WhatsApp for user ${user._id}: No phone number`);
        }

        return results;
      } catch (error) {
        console.error(`❌ Error sending notifications to user ${user._id}:`, error.message);
        return { email: false, sms: false, whatsapp: false };
      }
    });

    const results = await Promise.all(notificationPromises);
    
    const emailCount = results.filter(r => r.email === true).length;
    const smsCount = results.filter(r => r.sms === true).length;
    const whatsappCount = results.filter(r => r.whatsapp === true).length;

    console.log(`📧 Wishlist notifications for "${product.name}":`);
    console.log(`   📧 Emails: ${emailCount}/${usersWithProductInWishlist.length}`);
    console.log(`   📱 SMS: ${smsCount}/${usersWithProductInWishlist.length}`);
    console.log(`   💬 WhatsApp: ${whatsappCount}/${usersWithProductInWishlist.length}`);
    console.log('=== End Notification Check ===\n');

    return {
      email: { sent: emailCount, total: usersWithProductInWishlist.length },
      sms: { sent: smsCount, total: usersWithProductInWishlist.length },
      whatsapp: { sent: whatsappCount, total: usersWithProductInWishlist.length },
      skipped: false
    };
  } catch (error) {
    console.error('❌ Error sending wishlist notifications:', error);
    console.error('Error stack:', error.stack);
    return { sent: 0, error: error.message };
  }
};

