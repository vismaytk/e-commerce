var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection

mongoose.connect('mongodb://localhost:27017/product', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create a schema for products
const productSchema = new mongoose.Schema({
    productID: String,
    productName: String,
    ratings: [Number],
    meanRating: Number,
    ratingRank: String
});

const Product = mongoose.model('Product', productSchema);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index2.html'));
});

app.post('/', async function (req, res) {
    var action = req.body.action;  // Get the selected action
    var productID = req.body.ProductID;
    var productName = req.body.ProductName;
    var Rating1 = parseFloat(req.body.Rating1);
    var Rating2 = parseFloat(req.body.Rating2);
    var Rating3 = parseFloat(req.body.Rating3);
    var mean = (Rating1 + Rating2 + Rating3) / 3;

    var ratingRank;
    if (mean < 20) {
        ratingRank = "Low Quality";
    } else if (mean > 30 && mean <= 40) {
        ratingRank = "Medium Quality";
    } else if (mean > 40) {
        ratingRank = "High Quality";
    }

   
    if (action === "add") {
  
        const newProduct = new Product({
            productID: productID,
            productName: productName,
            ratings: [Rating1, Rating2, Rating3],
            meanRating: mean,
            ratingRank: ratingRank
        });

        try {
            await newProduct.save();
            res.send(`Product Added: <br> Product ID: ${productID} <br> Product Name: ${productName} <br> Rating Rank: ${ratingRank}`);
        } catch (error) {
            res.status(500).send("Error adding product.");
        }

    } else if (action === "delete") {
        // Delete a product
        try {
            await Product.deleteOne({ productID: productID });
            res.send(`Product with ID ${productID} deleted successfully.`);
        } catch (error) {
            res.status(500).send("Error deleting product.");
        }

    } else if (action === "update") {
        // Update a product
        try {
            await Product.updateOne(
                { productID: productID },
                { productName: productName, ratings: [Rating1, Rating2, Rating3], meanRating: mean, ratingRank: ratingRank }
            );
            res.send(`Product with ID ${productID} updated successfully.`);
        } catch (error) {
            res.status(500).send("Error updating product.");
        }

    } else if (action === "display") {
        // Display product details
        try {
            const product = await Product.findOne({ productID: productID });
            if (product) {
                res.send(`Product Details:<br>Product ID: ${product.productID}<br>Product Name: ${product.productName}<br>Rating Rank: ${product.ratingRank}`);
            } else {
                res.send(`No product found with ID ${productID}`);
            }
        } catch (error) {
            res.status(500).send("Error fetching product details.");
        }
    } else {
        res.send("Invalid action selected.");
    }
});

// Start the server
app.listen(8080, function () {
    console.log("Server is running on port 8080");
});
