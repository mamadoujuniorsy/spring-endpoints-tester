# Change Log

All notable changes to the "Spring Endpoints Tester" extension will be documented in this file.

## [0.0.1] - 2026-01-02

### Initial Release

- ✨ Automatic detection of Spring REST endpoints
- 📊 Spring Endpoints tree view in Explorer sidebar
- 🎯 CodeLens integration for quick testing
- 🌐 Integrated HTTP client with WebView
- 🔄 Auto-refresh on file changes
- 📋 Support for all Spring mapping annotations
- 🔍 Parameter detection (@PathVariable, @RequestParam, @RequestBody)
- 📝 Copy URL to clipboard
- ⚙️ Configurable base URL and auto-scan settings

### Supported Annotations
- Class-level: `@RestController`, `@Controller`, `@RequestMapping`
- Method-level: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`, `@RequestMapping`
- Parameter-level: `@PathVariable`, `@RequestParam`, `@RequestBody`

---

## Future Releases

### [0.1.0] - Planned
- [ ] Spring Security annotations support
- [ ] Auto-detect port from application.properties
- [ ] Multiple profiles support (dev, prod, etc.)
- [ ] Request history in HTTP client

### [0.2.0] - Planned
- [ ] Spring Actuator integration
- [ ] GraphQL endpoints support
- [ ] Export to Postman collections
- [ ] Kotlin support
