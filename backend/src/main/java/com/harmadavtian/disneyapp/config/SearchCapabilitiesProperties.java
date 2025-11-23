package com.harmadavtian.disneyapp.config;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Holds configuration describing which searchable categories/scopes/fields are
 * exposed to the UI.
 */
@Validated
@ConfigurationProperties(prefix = "search")
public class SearchCapabilitiesProperties {

    private int version = 1;
    @NotEmpty
    private Map<String, Category> categories = new LinkedHashMap<>();

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public Map<String, Category> getCategories() {
        return categories;
    }

    public void setCategories(Map<String, Category> categories) {
        this.categories = categories;
    }

    public static class Category {
        @NotNull
        private String label;
        @NotEmpty
        private Map<String, Scope> scopes = new LinkedHashMap<>();

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public Map<String, Scope> getScopes() {
            return scopes;
        }

        public void setScopes(Map<String, Scope> scopes) {
            this.scopes = scopes;
        }
    }

    public static class Scope {
        @NotNull
        private String label;
        @NotEmpty
        private List<String> fields;

        public Scope(@DefaultValue("") String label, @DefaultValue("[]") List<String> fields) {
            this.label = label;
            this.fields = fields;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public List<String> getFields() {
            return fields;
        }

        public void setFields(List<String> fields) {
            this.fields = fields;
        }
    }
}
