var { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');
var fs = require('fs');
var path = require('path');
var pdflibAddPlaceholder = require('@signpdf/placeholder-pdf-lib').pdflibAddPlaceholder;
var signpdf = require('@signpdf/signpdf').default;
var P12Signer = require('@signpdf/signer-p12').P12Signer;

async function work() {
    // contributing.pdf is the file that is going to be signed
    var sourcePath = path.join(__dirname, './resources/contributing.pdf');
    var pdfBuffer = fs.readFileSync(sourcePath);

    // certificate.p12 is the certificate that is going to be used to sign
    var certificatePath = path.join(__dirname, './resources/certificate.p12');
    var certificateBuffer = fs.readFileSync(certificatePath);
    var signer = new P12Signer(certificateBuffer);

    // Load the document into PDF-LIB
    PDFDocument.load(pdfBuffer).then(async function (pdfDoc) {
        

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        // Get the first page of the document
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]

        // Get the width and height of the first page
        const { width, height } = firstPage.getSize()

        console.log("width",width, "height", height);
        var text = 'This text was added with JavaScript by Vaibhav';
        var textSize = 10;
        var margin = 30;
        const textWidth = helveticaFont.widthOfTextAtSize(text, textSize)
        const textHeight = helveticaFont.heightAtSize(textSize)
        console.log("textWidth",textWidth, "textHeight", textHeight);
        // Draw a string of text diagonally across the first page
        var textDimen = {
            x: width - textWidth - margin,
            y: margin,
        }
        firstPage.drawText(text, {
            x: textDimen.x,
            y: textDimen.y,
            size: textSize,
            font: helveticaFont,
            color: rgb(0.95, 0.1, 0.1),
            rotate: degrees(0),
        })

        // Add a placeholder for a signature.
        pdflibAddPlaceholder({
            pdfDoc: pdfDoc,
            reason: 'The user is declaring consent through JavaScript.',
            contactInfo: 'signpdf@example.com',
            name: 'Vaibhav',
            location: 'Free Text Str., Free World',
            widgetRect:[textDimen.x - 5, textDimen.y + textHeight + 5 , textDimen.x + textWidth + 5,  textDimen.y - textHeight]
        });

        // Get the modified PDFDocument bytes
        pdfDoc.save().then(function (pdfWithPlaceholderBytes) {
            // And finally sign the document.
            signpdf
                .sign(pdfWithPlaceholderBytes, signer)
                .then(function (signedPdf) {
                    // signedPdf is a Buffer of an electronically signed PDF. Store it.
                    var targetPath = path.join(__dirname, './output/pdf-lib.pdf');
                    fs.writeFileSync(targetPath, signedPdf);
                })
        })
    })
}

work();