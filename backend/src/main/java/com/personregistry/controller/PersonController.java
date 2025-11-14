package com.personregistry.controller;

import com.personregistry.model.dto.PersonDto;
import com.personregistry.service.PersonService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/person")
public class PersonController {

    private final PersonService service;

    public PersonController(PersonService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public void create(@RequestBody PersonDto dto) {
        service.create(dto);
    }

    // GET BY CF
    @GetMapping("/{taxCode}")
    public PersonDto get(@PathVariable String taxCode) {
        return service.get(taxCode);
    }

    // LIST ALL
    @GetMapping
    public List<PersonDto> list() {
        return service.list();
    }

    // SEARCH BY NAME / SURNAME
    @GetMapping("/search")
    public List<PersonDto> searchByName(@RequestParam("name") String name) {
        return service.searchByName(name);
    }

    // UPDATE
    @PutMapping("/{taxCode}")
    public void update(@PathVariable String taxCode, @RequestBody PersonDto dto) {
        service.update(taxCode, dto);
    }

    // DELETE
    @DeleteMapping("/{taxCode}")
    public void delete(@PathVariable String taxCode) {
        service.delete(taxCode);
    }
}
