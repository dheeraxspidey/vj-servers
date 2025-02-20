const express = require('express');
const router = express.Router();
router.use(express.json());
const LostItem = require('../../models/LostItem');
const Item = require('../../models/FoundItem');
const { upload, cloudinary } = require('../../config/cloudinary')
const  auth =require('../../middlewares/auth')
const sendEmail = require("../../utils/notifications");

// Submit a lost item
router.post('/lost', async (req, res) => {
    try {
        const lostItem = new LostItem(req.body);
        await lostItem.save();
        console.log("submitted item with details",lostItem)
        res.status(201).json({ message: 'Lost item submitted successfully', lostItem });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting lost item', error });
    }
});



// Function to generate a random 4-character alphanumeric code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Function to ensure the code is unique
async function generateUniqueCode() {
  let code;
  let exists = true;
  while (exists) {
      code = generateCode();
      exists = await Item.exists({ code });
  }
  return code;
}

// Submit a found item
// Create new item
router.post('/found', upload.single('image'),auth, async (req, res) => {
  try {
      // Check if an image file was uploaded
      if (!req.file) {
          return res.status(400).json({
              success: false,
              message: 'Image file is required'
          });
      }

      const { itemName, description, foundLocation, reporterRollNo, category } = req.body;

      // Validate required fields
      if (!itemName || !description || !foundLocation || !reporterRollNo) {
          return res.status(400).json({
              success: false,
              message: 'All fields (title, description, foundLocation, reporterRollNo) are required'
          });
      }

      // Generate a unique 4-character code
      const uniqueCode = await generateUniqueCode();

      // Prepare item data with default handover location
      const itemData = {
          itemName,
          description,
          foundLocation,
          reporterRollNo,
          handoverLocation: 'Security Office',
          status: 'pending',
          code: uniqueCode, // Assign the generated unique code
          image: {
              url: req.file.path,
              public_id: req.file.filename
          },
          category
      };

      console.log('Creating item with data:', itemData);

      // Save the new item to the database
      const newItem = new Item(itemData);
      const savedItem = await newItem.save();

      return res.status(201).json({
          success: true,
          item: savedItem
      });
  } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({
          success: false,
          message: error.message || 'Internal server error'
      });
  }
});





// Search for found items
router.get('/found', async (req, res) => {
    try {
      // Fetch all items without any query condition
      const foundItems = await Item.find();
      
      if (foundItems.length === 0) {
        return res.status(404).json({ message: 'No found items available' });
      }
  
      res.status(200).json(foundItems);
    } catch (error) {
      console.error('Error fetching found items:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/reported/:id',async(req,res)=>{
    const ID=req.params.id;
    const reportedItems=await Item.find({ reporterRollNo:ID});
    res.send(reportedItems)

  })
  router.get('/lost-items/:id',async(req,res)=>{
    const ID=req.params.id;
    const reportedItems=await LostItem.find({ email:ID});
    res.send(reportedItems)

  })
// delete the reported items that found
  router.delete("/reported/:id", async (req, res) => {
    try {
      const ID = req.params.id;
      const item = await Item.findById(ID);
      if (!item) return res.status(404).json({ message: "Item not found" });
      if (item.status === "verified") return res.status(403).json({ message: "Cannot delete an verified item" });
  
      const deletedItem = await Item.findOneAndDelete({ _id: ID });
      res.json({ message: "Delete successful", payload: deletedItem });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // delete the items uploaded by a user that he lost
  router.delete("/delete-lostItem/:id", async (req, res) => {
    try {
      const ID = req.params.id;
      const item = await LostItem.findById(ID);
      if (!item) return res.status(404).json({ message: "Item not found" });
      if (item.status === "approved") return res.status(403).json({ message: "Cannot delete an approved item" });
  
      const deletedItem = await LostItem.findOneAndDelete({ _id: ID });
      res.json({ message: "Delete successful", payload: deletedItem });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });


  /////////////////////////////////////////////// ADMIN ROUTES///////////////////////////
  // admin upload
router.post('/admin/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });

    const { itemName, description, foundLocation, category } = req.body;
    if (!itemName || !description || !foundLocation || !category) 
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const newItem = await Item.create({
      itemName,
      description,
      foundLocation,
      category,
      handoverLocation: 'Security Office',
      status: 'verified', // Admin uploads directly as verified
      code: await generateUniqueCode(),
      image: { url: req.file.path, public_id: req.file.filename }
    });
    // If the item is verified, notify lost item owners with matching category
    if (category) {
      const lostItems = await LostItem.find({ category: newItem.category });
      if (lostItems.length > 0) {
        for (const lostItem of lostItems) {
          await sendEmail(
            lostItem.email, // lost user's email
            "Lost Item Match Found!",
            `Dear user, your lost ${newItem.category} "${newItem.itemName}" has been found and verified. Please check the portal for details.`
          );
          console.log("Email sent to:", lostItem.email);
        }
      } else {
        console.log("No lost items found matching category:", newItem.category);
      }
    }
    console.log("item created with data from admin",newItem)
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// handover items
router.put("/admin/:id/handover", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Proof image required" });

    const { id } = req.params;
    const { contact, rollNo, name } = req.body;

    if (!contact || !rollNo || !name) {
      return res.status(400).json({ success: false, message: "All fields (contact, rollNo, name) are required" });
    }

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Update status and store Cloudinary image details
    item.status = "claimed";
    item.claimerDetails = {
      contact,
      rollNo,
      name,
      proofs: [
        ...(item.claimerDetails?.proofs || []),
        { url: req.file.path, public_id: req.file.filename }
      ]
    };

    await item.save();
    console.log("Item handed over successfully with item details", item);
    res.json({ success: true, message: "Item handed over successfully", item });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



// Route to update item status and send the notification
router.patch("/admin/updatestatus", async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Item ID and status are required" });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Prevent changing a claimed item back to pending
    if (item.status === "claimed" && status === "pending") {
      return res.status(400).json({ message: "Cannot change claimed item back to pending" });
    }

    // Update only the status field in the database
    await Item.updateOne({ _id: id }, { $set: { status } });

    // If the item is verified, notify lost item owners with matching category
    if (status === "verified" && item.category) {
      const lostItems = await LostItem.find({ category: item.category });
      if (lostItems.length > 0) {
        for (const lostItem of lostItems) {
          await sendEmail(
            lostItem.email, // lost user's email
            "Lost Item Match Found!",
            `Dear user, your lost ${item.category} "${item.itemName}" has been found and verified. Please check the portal for details.`
          );
          console.log("Email sent to:", lostItem.email);
        }
      } else {
        console.log("No lost items found matching category:", item.category);
      }
    }

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
