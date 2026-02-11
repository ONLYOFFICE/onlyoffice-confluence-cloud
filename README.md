# ONLYOFFICE app for Confluence Cloud

Welcome to the official repository for the ONLYOFFICE app for Confluence Cloud!

Edit, co-author, and manage office files right inside [Confluence Cloud](https://www.atlassian.com/software/confluence/premium) pages using [ONLYOFFICE Docs](https://www.onlyoffice.com/docs). Open documents, spreadsheets, presentations, and PDFs from page attachments — edit them in-place and keep your Confluence content and files in sync.

<p align="center">
  <a href="https://marketplace.atlassian.com/apps/1218214/onlyoffice-connector-for-confluence?tab=overview&hosting=cloud">
    <img width="800" src="https://marketplace.atlassian.com/product-listing/files/d37cd602-344a-420c-b18c-997c7306ea8e?width=1840&height=900" alt="ONLYOFFICE for Confluence Cloud">
  </a>
</p>

## Features ✨

- **Open & edit inside Confluence:** Launch ONLYOFFICE editors directly from page attachments.  
- **Real-time co-editing:** Collaborate with colleagues using Fast and Strict modes, plus track changes, comments, and built-in chat.  
- **Wide format support:** Edit and view popular office formats.  
- **In-place saving:** Changes overwrite the same attachment file (saved as the page attachment).  
- **Secure connections:** JWT token protection is used for authenticated, safe access.  

### Supported formats 📚

**For viewing:**

* **WORD**: DOC, DOCM, DOCX, DOT, DOTM, DOTX, EPUB, FB2, FODT, HTM, HTML, MHT, MHTML, ODT, OTT, RTF, STW, SXW, TXT, WPS, WPT, XML
* **CELL**: CSV, ET, ETT, FODS, ODS, OTS, SXC, XLS, XLSB, XLSM, XLSX, XLT, XLTM, XLTX
* **SLIDE**: DPS, DPT, FODP, ODP, OTP, POT, POTM, POTX, PPS, PPSM, PPSX, PPT, PPTM, PPTX, SXI
* **PDF**: DJVU, OXPS, PDF, XPS

**For editing:**

* **WORD**: DOCM, DOCX, DOTM, DOTX
* **CELL**: XLSM, XLSX, XLTM, XLTX
* **SLIDE**: POTM, POTX, PPSM, PPSX, PPTM, PPTX
* **PDF**: PDF

## Installing ONLYOFFICE Docs

To be able to edit documents in Confluence Cloud, you will need an instance of [ONLYOFFICE Docs](https://www.onlyoffice.com/docs) (Document Server). You can install free Community version or scalable Enterprise Edition.

To install **free Community version**, use [Docker](https://github.com/onlyoffice/Docker-DocumentServer) (recommended) or follow [these instructions](https://helpcenter.onlyoffice.com/docs/installation/docs-community-install-ubuntu.aspx) for Debian, Ubuntu, or derivatives.

To install **Enterprise Edition**, follow instructions [here](https://helpcenter.onlyoffice.com/docs/installation/enterprise).

Community Edition vs Enterprise Edition comparison can be found [here](#onlyoffice-docs-editions).

Alternatively, you can opt for **ONLYOFFICE Docs Cloud** which doesn't require downloading and installation. To get ONLYOFFICE Docs Cloud, get started [here](https://www.onlyoffice.com/docs-registration).

## App configuration ⚙️

Administrators can configure ONLYOFFICE integration app via the **Manage Apps** section in Confluence Cloud (Apps -> Manage Apps -> ONLYOFFICE -> Configure). On the configuration page, set up:

* **Document Editing Service Address**: The URL of the installed ONLYOFFICE Docs (Document Server).

* **Secret key**: Enables JWT to protect your documents from unauthorized access (further information can be found [here](https://api.onlyoffice.com/docs/docs-api/additional-api/signature/).

* **JWT Header**: Name of the header to pass the JWT in, if you use a custom header in your server

## App usage

In the Pages module, you can attach files to the created pages: open the right context menu, click on the Attachments item and upload a file from the device. 

The uploaded file will appear in the Attachments list. To launch the editor, click **Edit in ONLYOFFICE**. The file opens in the same window. The changes made are saved in the same file.

> Note: If a file is not supported by ONLYOFFICE, the integration will show an error message.

## ONLYOFFICE Docs editions 

ONLYOFFICE offers different versions of its online document editors that can be deployed on your own servers.

**ONLYOFFICE Docs** packaged as Document Server: 

* Community Edition 🆓 (`onlyoffice-documentserver` package)
* Enterprise Edition 🏢 (`onlyoffice-documentserver-ee` package)

The table below will help you to make the right choice.

| Pricing and licensing | Community Edition | Enterprise Edition |
| ------------- | ------------- | ------------- |
| | [Get it now](https://www.onlyoffice.com/download-community?utm_source=github&utm_medium=cpc&utm_campaign=GitHubConfluenceCloud#docs-community)  | [Start Free Trial](https://www.onlyoffice.com/download?utm_source=github&utm_medium=cpc&utm_campaign=GitHubConfluenceCloud#docs-enterprise)  |
| Cost  | FREE  | [Go to the pricing page](https://www.onlyoffice.com/docs-enterprise-prices?utm_source=github&utm_medium=cpc&utm_campaign=GitHubConfluenceCloud)  |
| Simultaneous connections | up to 20 maximum  | As in chosen pricing plan |
| Number of users | up to 20 recommended | As in chosen pricing plan |
| License | GNU AGPL v.3 | Proprietary |
| **Support** | **Community Edition** | **Enterprise Edition** |
| Documentation | [Help Center](https://helpcenter.onlyoffice.com/docs/installation/community) | [Help Center](https://helpcenter.onlyoffice.com/docs/installation/enterprise) |
| Standard support | [GitHub](https://github.com/ONLYOFFICE/DocumentServer/issues) or paid | 1 or 3 years support included |
| Premium support | [Contact us](mailto:sales@onlyoffice.com) | [Contact us](mailto:sales@onlyoffice.com) |
| **Services** | **Community Edition** | **Enterprise Edition** |
| Conversion Service                | + | + |
| Document Builder Service          | + | + |
| **Interface** | **Community Edition** | **Enterprise Edition** |
| Tabbed interface                  | + | + |
| Dark theme                        | + | + |
| 125%, 150%, 175%, 200% scaling    | + | + |
| White Label                       | - | - |
| Integrated test example (node.js) | + | + |
| Mobile web editors                | - | +* |
| **Plugins & Macros** | **Community Edition** | **Enterprise Edition** |
| Plugins                           | + | + |
| Macros                            | + | + |
| **Collaborative capabilities** | **Community Edition** | **Enterprise Edition** |
| Two co-editing modes              | + | + |
| Comments                          | + | + |
| Built-in chat                     | + | + |
| Review and tracking changes       | + | + |
| Display modes of tracking changes | + | + |
| Version history                   | + | + |
| **Document Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Adding Content control          | + | + |
| Editing Content control         | + | + |
| Layout tools                    | + | + |
| Table of contents               | + | + |
| Navigation panel                | + | + |
| Mail Merge                      | + | + |
| Comparing Documents             | + | + |
| **Spreadsheet Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Functions, formulas, equations  | + | + |
| Table templates                 | + | + |
| Pivot tables                    | + | + |
| Data validation                 | + | + |
| Conditional formatting          | + | + |
| Sparklines                      | + | + |
| Sheet Views                     | + | + |
| **Presentation Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Transitions                     | + | + |
| Animations                      | + | + |
| Presenter mode                  | + | + |
| Notes                           | + | + |
| **Form creator features** | **Community Edition** | **Enterprise Edition** |
| Adding form fields              | + | + |
| Form preview                    | + | + |
| Saving as PDF                   | + | + |
| **PDF Editor features**      | **Community Edition** | **Enterprise Edition** |
| Text editing and co-editing                                | + | + |
| Work with pages (adding, deleting, rotating)               | + | + |
| Inserting objects (shapes, images, hyperlinks, etc.)       | + | + |
| Text annotations (highlight, underline, cross out, stamps) | + | + |
| Comments                        | + | + |
| Freehand drawings               | + | + |
| Form filling                    | + | + |
| | [Get it now](https://www.onlyoffice.com/download-community?utm_source=github&utm_medium=cpc&utm_campaign=GitHubConfluenceCloud#docs-community)  | [Start Free Trial](https://www.onlyoffice.com/download?utm_source=github&utm_medium=cpc&utm_campaign=GitHubConfluenceCloud#docs-enterprise)  |

\* If supported by DMS.

## Need help? User Feedback and Support 💡

* **🐞 Found a bug?** Please report it by creating an [issue](https://github.com/ONLYOFFICE/onlyoffice-confluence-cloud/issues).
* **❓ Have a question?** Ask our community and developers on the [ONLYOFFICE Forum](https://community.onlyoffice.com).
* **👨‍💻 Need help for developers?** Check our [API documentation](https://api.onlyoffice.com).
* **💡 Want to suggest a feature?** Share your ideas on our [feedback platform](https://feedback.onlyoffice.com/forums/966080-your-voice-matters).

---
<p align="center">
  Made with ❤️ by the <a href="https://www.onlyoffice.com/">ONLYOFFICE Team</a>
</p>