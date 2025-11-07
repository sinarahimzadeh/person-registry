package com.personregistry.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final AddressRepository addressRepository;

    // CREATE
    @Transactional
    public void create(PersonDto dto) {
        String cf = dto.getTaxCode().toUpperCase();
        if (personRepository.existsByTaxCode(cf)) {
            throw new IllegalArgumentException("Tax code already exists");
        }

        // save person
        Person p = new Person();
        p.setTaxCode(cf);
        p.setName(dto.getName());
        p.setSurname(dto.getSurname());
        personRepository.save(p);

        // save address
        Address a = new Address();
        a.setPersonTaxCode(cf);
        a.setStreet(dto.getAddress().getStreet());
        a.setStreetNo(dto.getAddress().getStreetNo());
        a.setCity(dto.getAddress().getCity());
        a.setProvince(dto.getAddress().getProvince().toUpperCase());
        a.setCountry(dto.getAddress().getCountry());
        addressRepository.save(a);
    }

    // READ (returns DTO merged from person + address)
    @Transactional(readOnly = true)
    public PersonDto get(String taxCode) {
        String cf = taxCode.toUpperCase();

        Person p = personRepository.findByTaxCode(cf);
        if (p == null) throw new RuntimeException("Not found");

        Address a = addressRepository.findByPersonTaxCode(cf);
        if (a == null) throw new RuntimeException("Address not found");

        PersonDto dto = new PersonDto();
        dto.setTaxCode(p.getTaxCode());
        dto.setName(p.getName());
        dto.setSurname(p.getSurname());

        PersonDto.AddressDto ad = new PersonDto.AddressDto();
        ad.setStreet(a.getStreet());
        ad.setStreetNo(a.getStreetNo());
        ad.setCity(a.getCity());
        ad.setProvince(a.getProvince());
        ad.setCountry(a.getCountry());
        dto.setAddress(ad);

        return dto;
    }

    // UPDATE (CF is immutable)
    @Transactional
    public void update(String taxCode, PersonDto dto) {
        String cf = taxCode.toUpperCase();

        Person p = personRepository.findByTaxCode(cf);
        if (p == null) throw new RuntimeException("Not found");

        p.setName(dto.getName());
        p.setSurname(dto.getSurname());
        personRepository.save(p);

        Address a = addressRepository.findByPersonTaxCode(cf);
        if (a == null) {
            a = new Address();
            a.setPersonTaxCode(cf);
        }
        a.setStreet(dto.getAddress().getStreet());
        a.setStreetNo(dto.getAddress().getStreetNo());
        a.setCity(dto.getAddress().getCity());
        a.setProvince(dto.getAddress().getProvince().toUpperCase());
        a.setCountry(dto.getAddress().getCountry());
        addressRepository.save(a);
    }

    // DELETE (person + address)
    @Transactional
    public void delete(String taxCode) {
        String cf = taxCode.toUpperCase();

        // delete child first (address), then person
        addressRepository.deleteByPersonTaxCode(cf);

        Person p = personRepository.findByTaxCode(cf);
        if (p != null) {
            personRepository.delete(p);
        }
    }
}
