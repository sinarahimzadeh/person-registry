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

    @PostMapping
    public void create(@RequestBody PersonDto dto) {
        service.create(dto);
    }

    @GetMapping("/{taxCode}")
    public PersonDto get(@PathVariable String taxCode) {
        return service.get(taxCode);
    }

    @GetMapping
    public List<PersonDto> list() {
        return service.list();
    }

    @PutMapping("/{taxCode}")
    public void update(@PathVariable String taxCode, @RequestBody PersonDto dto) {
        service.update(taxCode, dto);
    }

    @DeleteMapping("/{taxCode}")
    public void delete(@PathVariable String taxCode) {
        service.delete(taxCode);
    }
}
