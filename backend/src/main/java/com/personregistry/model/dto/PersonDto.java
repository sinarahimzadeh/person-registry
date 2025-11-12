package com.personregistry.model.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PersonDto {

    @NotBlank
    @Pattern(regexp = "^[A-Z0-9]{16}$")
    private String taxCode;

    @NotBlank
    private String name;

    @NotBlank
    private String surname;

    @NotNull
    private AddressDto address;
}
