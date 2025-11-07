package com.personregistry.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000"}) // allow React dev server
public class PersonController {

    private final PersonService personService;

    // CREATE person + address
    @PostMapping
    public ResponseEntity<Void> create(@Validated @RequestBody PersonDto dto) {
        personService.create(dto);
        return ResponseEntity.ok().build();
    }

 
    @GetMapping("/{taxCode}")
    public ResponseEntity<PersonDto> get(@PathVariable String taxCode) {
        return ResponseEntity.ok(personService.get(taxCode));
    }

    @PutMapping("/{taxCode}")
    public ResponseEntity<Void> update(@PathVariable String taxCode,
                                       @Validated @RequestBody PersonDto dto) {
        personService.update(taxCode, dto);
        return ResponseEntity.ok().build();
    }

    // DELETE person + address
    @DeleteMapping("/{taxCode}")
    public ResponseEntity<Void> delete(@PathVariable String taxCode) {
        personService.delete(taxCode);
        return ResponseEntity.noContent().build();
    }
}
