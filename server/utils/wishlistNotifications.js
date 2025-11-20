const User = require('../models/User');
const Product = require('../models/Product');
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
    // Convert Mongoose document to plain object if needed
    let productData = product;
    if (product && typeof product.toObject === 'function') {
      productData = product.toObject({ getters: true, virtuals: false });
    } else if (product && typeof product.toJSON === 'function') {
      productData = product.toJSON();
    }
    
    // Ensure we have the product data
    if (!productData || !productData._id) {
      console.log('⚠️ Invalid product data passed to notifyWishlistUsers');
      return { sent: 0, error: 'Invalid product data' };
    }
    
    // Fetch fresh product data from database to ensure all fields are populated
    try {
      const freshProduct = await Product.findById(productData._id)
        .select('name price originalPrice imageUrl images comingSoon inStock stockCount category');
      
      if (freshProduct) {
        // Convert to plain object
        productData = freshProduct.toObject ? freshProduct.toObject({ getters: true, virtuals: false }) : freshProduct;
        console.log('✅ Fetched fresh product data from database');
      } else {
        console.log('⚠️ Could not fetch fresh product data, using provided data');
      }
    } catch (error) {
      console.log('⚠️ Error fetching fresh product data:', error.message);
      // Continue with existing productData
    }
    
    console.log('=== Wishlist Notification Check ===');
    console.log('Product:', productData.name, 'ID:', productData._id);
    console.log('Product ImageUrl:', productData.imageUrl);
    console.log('Product Images:', productData.images);
    console.log('Product Price:', productData.price);
    console.log('Product ComingSoon:', productData.comingSoon);
    console.log('Product InStock:', productData.inStock);
    console.log('Previous State:', {
      comingSoon: previousState.comingSoon,
      inStock: previousState.inStock,
      stockCount: previousState.stockCount,
      price: previousState.price
    });
    console.log('Current State:', {
      comingSoon: productData.comingSoon,
      inStock: productData.inStock,
      stockCount: productData.stockCount,
      price: productData.price
    });

    // Check previous state
    const wasComingSoon = previousState.comingSoon === true || 
                          previousState.price === null || 
                          previousState.price === undefined;
    
    const wasInStock = previousState.inStock === true && 
                       (previousState.stockCount === undefined || previousState.stockCount > 0);
    
    const wasOutOfStock = previousState.inStock === false || 
                         (previousState.stockCount !== undefined && previousState.stockCount === 0 && previousState.inStock !== true);
    
    const hadPrice = previousState.price !== null && 
                     previousState.price !== undefined &&
                     typeof previousState.price === 'number' &&
                     previousState.price > 0;
    
    // Check current state using productData
    const isNowAvailable = productData.comingSoon === false && 
                          productData.price !== null && 
                          productData.price !== undefined &&
                          typeof productData.price === 'number' &&
                          productData.price > 0;
    
    const isNowInStock = productData.inStock === true && 
                        (productData.stockCount === undefined || productData.stockCount > 0);
    
    const isNowOutOfStock = productData.inStock === false || 
                           (productData.stockCount !== undefined && productData.stockCount === 0 && productData.inStock !== true);
    
    const isNowComingSoon = productData.comingSoon === true || 
                           productData.price === null || 
                           productData.price === undefined;

    console.log('Detection:', {
      wasComingSoon,
      wasInStock,
      wasOutOfStock,
      hadPrice,
      isNowAvailable,
      isNowInStock,
      isNowOutOfStock,
      isNowComingSoon
    });

    // Determine what changed
    let notificationType = null;
    let notificationMessage = '';

    // Case 1: Product was coming soon (no price) and now has price and is available
    if (wasComingSoon && isNowAvailable) {
      notificationType = 'coming_soon_available';
      notificationMessage = `Great news! "${productData.name}" is now available for purchase!`;
      console.log('✅ Triggering: Coming Soon -> Available');
    } 
    // Case 2: Product was out of stock and now has stock
    else if (wasOutOfStock && isNowInStock) {
      notificationType = 'back_in_stock';
      notificationMessage = `Good news! "${productData.name}" is back in stock!`;
      console.log('✅ Triggering: Out of Stock -> In Stock');
    }
    // Case 3: Product was in stock and now is out of stock
    else if (wasInStock && isNowOutOfStock) {
      notificationType = 'out_of_stock';
      notificationMessage = `Update: "${productData.name}" is currently out of stock.`;
      console.log('✅ Triggering: In Stock -> Out of Stock');
    }
    // Case 4: Product had price (was available) and now is coming soon (no price)
    else if (hadPrice && isNowComingSoon && !wasComingSoon) {
      notificationType = 'coming_soon';
      notificationMessage = `Update: "${productData.name}" is now marked as coming soon.`;
      console.log('✅ Triggering: Available -> Coming Soon');
    }

    // Only send notifications if there's a relevant change
    if (!notificationType) {
      console.log('⏭️ Skipping: No relevant state change detected');
      return { sent: 0, skipped: true };
    }

    // Find all users who have this product in their wishlist
    const usersWithProductInWishlist = await User.find({
      wishlist: productData._id,
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
    const siteUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const productUrl = `${siteUrl}/product/${productData._id}`;
    
    // Get product image - prioritize imageUrl, then images array, then default
    // Ensure we check all possible image fields
    let productImage = productData.imageUrl || 
                      (productData.images && Array.isArray(productData.images) && productData.images.length > 0 && productData.images[0]) ||
                      productData.image ||
                      '/4.webp';
    
    console.log('🖼️ Raw productImage value:', productImage);
    
    // Clean up image path - remove any whitespace and handle null/undefined
    if (productImage && typeof productImage === 'string') {
      productImage = productImage.trim();
    } else if (!productImage || productImage === null || productImage === undefined || productImage === 'null' || productImage === 'undefined') {
      productImage = '/4.webp';
      console.log('⚠️ Image was null/undefined, using default');
    }
    
    // Handle empty strings
    if (productImage === '' || productImage === ' ') {
      productImage = '/4.webp';
      console.log('⚠️ Image was empty, using default');
    }
    
    // If image is a relative path, make it absolute
    // Check if it's already an absolute URL (http/https) or data URI
    if (productImage && 
        !productImage.startsWith('http://') && 
        !productImage.startsWith('https://') && 
        !productImage.startsWith('data:')) {
      const imagePath = productImage.startsWith('/') ? productImage : `/${productImage}`;
      
      // If image is in /uploads/ directory, use backend URL (backend serves these)
      // Otherwise, use frontend URL for public assets
      if (imagePath.startsWith('/uploads/')) {
        productImage = `${backendUrl}${imagePath}`;
        console.log('🖼️ Using backend URL for uploads:', productImage);
      } else {
        productImage = `${siteUrl}${imagePath}`;
        console.log('🖼️ Using frontend URL for public assets:', productImage);
      }
    } else {
      console.log('🖼️ Image already absolute URL:', productImage);
    }
    
    // Determine if product has a valid price (not coming soon)
    // For back_in_stock notifications, check if price exists even if comingSoon flag exists
    const hasValidPrice = productData.price !== null && 
                         productData.price !== undefined && 
                         typeof productData.price === 'number' && 
                         productData.price > 0 &&
                         (productData.comingSoon !== true); // Only show price if not explicitly coming soon
    
    console.log('💰 Price check:', {
      price: productData.price,
      comingSoon: productData.comingSoon,
      hasValidPrice: hasValidPrice
    });
    
    const productPrice = hasValidPrice ? `Rs. ${productData.price.toLocaleString()}` : 'Price: Coming Soon';

    // Prepare SMS/WhatsApp message (shorter format)
    let smsMessage = '';
    const smsPriceText = hasValidPrice ? `Price: Rs. ${productData.price.toLocaleString()}` : 'Price: Coming Soon';
    
    if (notificationType === 'coming_soon_available' || notificationType === 'back_in_stock') {
      smsMessage = `${notificationMessage}\n\nProduct: ${productData.name}\n${smsPriceText}\n\nView: ${productUrl}\n\n- Valora Gold`;
    } else if (notificationType === 'out_of_stock') {
      smsMessage = `${notificationMessage}\n\nProduct: ${productData.name}\n\nWe'll notify you when it's back in stock.\n\nView: ${productUrl}\n\n- Valora Gold`;
    } else if (notificationType === 'coming_soon') {
      smsMessage = `${notificationMessage}\n\nProduct: ${productData.name}\n\nWe'll notify you when it's available for purchase.\n\nView: ${productUrl}\n\n- Valora Gold`;
    }

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
          let subject = '';
          if (notificationType === 'coming_soon_available') {
            subject = `🎉 "${productData.name}" is Now Available!`;
          } else if (notificationType === 'back_in_stock') {
            subject = `✅ "${productData.name}" is Back in Stock!`;
          } else if (notificationType === 'out_of_stock') {
            subject = `⚠️ "${productData.name}" is Out of Stock`;
          } else if (notificationType === 'coming_soon') {
            subject = `⏳ "${productData.name}" is Coming Soon`;
          }
          
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
                    <td style="background: ${notificationType === 'coming_soon_available' || notificationType === 'back_in_stock' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : notificationType === 'out_of_stock' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}; padding: 30px; text-align: center;">
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
                        : notificationType === 'back_in_stock'
                        ? `<p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Stock has been added to the product you were waiting for. Don't miss out!
                          </p>`
                        : notificationType === 'out_of_stock'
                        ? `<p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            The product you added to your wishlist is currently out of stock. We'll notify you when it becomes available again.
                          </p>`
                        : `<p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            The product you added to your wishlist has been marked as coming soon. We'll notify you when it becomes available for purchase.
                          </p>`
                      }

                      <!-- Product Details (without image) -->
                      <div style="background-color: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${productData.name}</h3>
                        ${hasValidPrice
                          ? `<p style="color: #22c55e; font-size: 20px; font-weight: bold; margin: 10px 0;">Rs. ${productData.price.toLocaleString()}</p>`
                          : `<p style="color: #666666; font-size: 16px; margin: 10px 0; font-style: italic;">Price: Coming Soon</p>`
                        }
                        ${hasValidPrice && productData.originalPrice && productData.originalPrice > productData.price 
                          ? `<p style="color: #999999; font-size: 14px; margin: 5px 0; text-decoration: line-through;">Rs. ${productData.originalPrice.toLocaleString()}</p>`
                          : ''
                        }
                      </div>

                      <!-- CTA Button (only show for available/in stock products) -->
                      ${(notificationType === 'coming_soon_available' || notificationType === 'back_in_stock') 
                        ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${productUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                  View Product
                                </a>
                              </td>
                            </tr>
                          </table>`
                        : `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${productUrl}" style="display: inline-block; background-color: #6b7280; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                  View Product Details
                                </a>
                              </td>
                            </tr>
                          </table>`
                      }

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
  : notificationType === 'back_in_stock'
  ? 'Stock has been added to the product you were waiting for. Don\'t miss out!'
  : notificationType === 'out_of_stock'
  ? 'The product you added to your wishlist is currently out of stock. We\'ll notify you when it becomes available again.'
  : 'The product you added to your wishlist has been marked as coming soon. We\'ll notify you when it becomes available for purchase.'
}

Product: ${productData.name}
${hasValidPrice ? `Price: Rs. ${productData.price.toLocaleString()}` : 'Price: Coming Soon'}
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

    console.log(`📧 Wishlist notifications for "${productData.name}":`);
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

