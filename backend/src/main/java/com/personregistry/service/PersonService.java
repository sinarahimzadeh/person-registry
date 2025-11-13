package com.personregistry.service;

import com.personregistry.model.dto.AddressDto;
import com.personregistry.model.dto.PersonDto;
import com.personregistry.model.persistence.Address;
import com.personregistry.model.persistence.Person;
import com.personregistry.repository.AddressRepository;
import com.personregistry.repository.PersonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hibernate.LazyInitializationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        Address address = findOrCreate(dto.getAddress());
        Person p = new Person();
        p.setTaxCode(cf);
        p.setName(dto.getName());
        p.setSurname(dto.getSurname());
        p.setAddress(address);
        personRepository.save(p);
    }

    // GET BY CF
    @Transactional(readOnly = true)
    public PersonDto get(String taxCode) {
        String cf = taxCode.toUpperCase();
        Person p = personRepository.findByTaxCode(cf);
        if (p == null) throw new RuntimeException("Not found");
        return toDtoSafe(p);
    }

    // LIST ALL
    @Transactional(readOnly = true)
    public List<PersonDto> list() {
        return personRepository.findAll()
                .stream()
                .map(this::toDtoSafe)
                .toList();
    }

    // SEARCH BY NAME OR SURNAME (contains, case-insensitive)
    @Transactional(readOnly = true)
    public List<PersonDto> searchByName(String name) {
        String q = name == null ? "" : name.trim().toLowerCase();
        if (q.isEmpty()) return List.of();

        return personRepository.findAll().stream()
                .filter(p -> {
                    String n = p.getName() == null ? "" : p.getName().toLowerCase();
                    String s = p.getSurname() == null ? "" : p.getSurname().toLowerCase();
                    return n.contains(q) || s.contains(q);
                })
                .map(this::toDtoSafe)
                .toList();
    }

    // UPDATE (CF is immutable)
    @Transactional
    public void update(String taxCode, PersonDto dto) {
        String cf = taxCode.toUpperCase();
        Person p = personRepository.findByTaxCode(cf);
        if (p == null) throw new RuntimeException("Not found");
        p.setName(dto.getName());
        p.setSurname(dto.getSurname());
        p.setAddress(findOrCreate(dto.getAddress()));
        personRepository.save(p);
    }

    // DELETE
    @Transactional
    public void delete(String taxCode) {
        String cf = taxCode.toUpperCase();
        Person p = personRepository.findByTaxCode(cf);
        if (p != null) {
            personRepository.delete(p);
        }
    }

    // HELPER: find or create address
    private Address findOrCreate(AddressDto a) {
        String province = a.getProvince() == null ? null : a.getProvince().toUpperCase();
        return addressRepository
                .findByStreetAndStreetNoAndCityAndProvinceAndCountry(
                        a.getStreet(), a.getStreetNo(), a.getCity(), province, a.getCountry())
                .orElseGet(() -> {
                    Address e = new Address();
                    e.setStreet(a.getStreet());
                    e.setStreetNo(a.getStreetNo());
                    e.setCity(a.getCity());
                    e.setProvince(province);
                    e.setCountry(a.getCountry());
                    return addressRepository.save(e);
                });
    }

    // HELPER: safe DTO mapping (ignores broken/lazy address)
    private PersonDto toDtoSafe(Person p) {
        PersonDto dto = new PersonDto();
        dto.setTaxCode(p.getTaxCode());
        dto.setName(p.getName());
        dto.setSurname(p.getSurname());

        try {
            Address a = p.getAddress();
            if (a != null) {
                AddressDto ad = new AddressDto();
                ad.setStreet(a.getStreet());
                ad.setStreetNo(a.getStreetNo());
                ad.setCity(a.getCity());
                ad.setProvince(a.getProvince());
                ad.setCountry(a.getCountry());
                dto.setAddress(ad);
            }
        } catch (EntityNotFoundException | LazyInitializationException ex) {
            dto.setAddress(null);
        }

        return dto;
    }
}
