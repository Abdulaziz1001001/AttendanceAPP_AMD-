const express = require('express');
const Record = require('../models/Record');
const router = express.Router();

router.post('/record', async (req, res) => {
    try {
        const { employeeId, date, checkIn, checkOut, checkInLat, checkInLng, checkOutLat, checkOutLng, zoneId, status, notes } = req.body;
        
        // إذا كان إنصراف (Checkout)
        if (checkOut) {
            let rec = await Record.findOne({ employeeId, date });
            if(rec) {
                rec.checkOut = checkOut;
                rec.checkOutLat = checkOutLat;
                rec.checkOutLng = checkOutLng;
                rec.status = status;
                rec.notes = notes;
                await rec.save();
            }
        } else {
            // تسجيل حضور (Checkin)
            const rec = new Record({ employeeId, date, checkIn, checkInLat, checkInLng, zoneId, status, notes });
            await rec.save();
        }
        res.json({msg: 'Success'});
    } catch(e) { res.status(500).json({msg: 'Error'}); }
});

module.exports = router;
