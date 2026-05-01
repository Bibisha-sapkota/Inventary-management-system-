const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit an inquiry
// @route   POST /api/inquiries
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and message'
            });
        }

        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            subject,
            message
        });

        // Send Email Notification to Admin
        try {
            console.log(`[INQUIRY] Attempting to notify admin: np03cs4s240223@heraldcollege.edu.np`);
            await sendEmail({
                email: 'np03cs4s240223@heraldcollege.edu.np',
                subject: `New Inquiry: ${subject} from ${name}`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background-color: #f4f7f6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 15px; overflow: hidden; shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            <div style="background-color: #1db054; padding: 20px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">New Business Inquiry</h1>
                            </div>
                            <div style="padding: 30px;">
                                <p style="font-size: 16px; line-height: 1.6;">You have received a new message from the Stock Inventory System contact form.</p>
                                
                                <div style="margin: 20px 0; border-left: 4px solid #1db054; padding-left: 20px; background: #f9f9f9; padding: 15px;">
                                    <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                                </div>

                                <p style="font-weight: bold; margin-bottom: 10px;">Message Content:</p>
                                <div style="background-color: #f1f1f1; padding: 20px; border-radius: 10px; font-style: italic;">
                                    "${message}"
                                </div>

                                <div style="margin-top: 30px; text-align: center;">
                                    <a href="mailto:${email}" style="background-color: #1db054; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reply to ${name}</a>
                                </div>
                            </div>
                            <div style="background-color: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
                                <p>© 2024 Stock Inventory System | Automated Notification</p>
                            </div>
                        </div>
                    </div>
                `
            });
            console.log(`[INQUIRY] Admin notified successfully: np03cs4s240223@heraldcollege.edu.np`);
        } catch (emailErr) {
            console.error('Failed to send inquiry notification email:', emailErr);
        }

        res.status(201).json({
            success: true,
            data: inquiry,
            message: 'Inquiry submitted successfully. We will get back to you soon!'
        });
    } catch (error) {
        console.error('Inquiry Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting inquiry'
        });
    }
});

// @desc    Get all inquiries
router.get('/', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching inquiries'
        });
    }
});

module.exports = router;
