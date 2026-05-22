# Change Log

##
## Added
- new empty file templates
- Forge settings page for configuring ONLYOFFICE Docs connection and demo server access
- space page and content action for browsing Confluence pages, blog posts, and attachments
- content tree actions to create, open, download, and delete attachments
- support for opening referenced documents from the editor

## Changed
- migrated the app from the legacy Atlassian Connect remote app to Forge with Custom UI
- extended list of supported formats
- improved the file browser with localized UI, search, filters, sorting, breadcrumbs, and pagination
- updated editor authorization and configuration flow to use Forge resolvers and backend editor config

## Fixed
- duplicate attachment name handling during file creation
- error states for missing editor configuration, unavailable ONLYOFFICE Docs API, and missing content
- editor session reauthorization before session expiration

## Removed
- legacy Atlassian Connect remote app and related deployment assets

## 1.2.0
## Added
- creating new documents
- user image in editor
- editing pdf
- Paste Special to add a link between files

## Changed
- extended list of supported formats

## 1.0.0
## Added
- configuration page
- collaboration editing for DOCX, XLSX, PPTX
- view option DJVU, DOC, DOCM, DOCX, DOT, DOTM, DOTX, EPUB, FB2, FODT, HTML, MHT, ODT, OTT, OXPS, PDF, RTF, TXT, XPS, XML, CSV, FODS, ODS, OTS, XLS, XLSM, XLSX, XLT, XLTM, XLTX, FODP, ODP, OTP, POT, POTM, POTX, PPS, PPSM, PPSX, PPT, PPTM, PPTX
- JWT support
